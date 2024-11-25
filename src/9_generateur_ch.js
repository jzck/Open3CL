import enums from './enums.js';
import { requestInput, requestInputID, tv, tvColumnIDs } from './utils.js';
import { conso_aux_distribution_ch, conso_aux_gen } from './15_conso_aux.js';
import { conso_ch } from './9_conso_ch.js';
import { calc_generateur_combustion_ch } from './13.2_generateur_combustion_ch.js';
import { scopOrCop } from './12.4_pac.js';

function pertes_gen_ch(Bch_hp_j, pn) {
  const pertes = (1.3 * Bch_hp_j) / (0.3 * pn);
  return pertes;
}

function pertes_gen_ecs(nrefj) {
  const pertes = (nrefj * 1790) / 8760;
  return pertes;
}

export function calc_Qrec_gen_j(gen_ch, nrefj, Bch_hp_j) {
  const de = gen_ch.donnee_entree;
  const du = gen_ch.donnee_utilisateur || {};
  const di = gen_ch.donnee_intermediaire;

  if (de.position_volume_chauffe === 0) return 0;

  const type_gen_ch = enums.type_generateur_ch[de.enum_type_generateur_ch_id];
  if (type_gen_ch.includes('générateur à air chaud')) return 0;

  let Cper;
  if (de.presence_ventouse === 1) Cper = 0.75;
  else Cper = 0.5;

  const usage_generateur = requestInput(de, du, 'usage_generateur');

  let Dperj;
  if (usage_generateur === 'chauffage') Dperj = Math.min(nrefj, pertes_gen_ch(Bch_hp_j, di.pn));
  else if (usage_generateur === 'ecs') Dperj = pertes_gen_ecs(nrefj);
  else if (usage_generateur === 'chauffage + ecs') {
    Dperj = Math.min(nrefj, pertes_gen_ch(Bch_hp_j, di.pn) + pertes_gen_ecs(nrefj));
  }

  gen_ch.donnee_utilisateur = du;
  const Qrec_gen_j = 0.48 * Cper * di.qp0 * Dperj || 0;
  return Qrec_gen_j;
}

function tv_rendement_generation(di, de, du) {
  const matcher = {
    enum_type_generateur_ch_id: requestInputID(de, du, 'type_generateur_ch')
  };
  const row = tv('rendement_generation', matcher, de);
  if (row) {
    di.rendement_generation = Number(row.rg);
    di.rg = di.rendement_generation;
    di.rg_dep = di.rendement_generation;
    de.tv_rendement_generation_id = Number(row.tv_rendement_generation_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour rendement_generation ch !!');
  }
}

export function type_generateur_ch(di, de, du, usage_generateur) {
  let type_generateur;
  if (usage_generateur === 'chauffage') {
    type_generateur = requestInputID(de, du, 'type_generateur_ch');
  } else if (usage_generateur === 'chauffage + ecs') {
    const generateur_ecs = enums.type_generateur_ecs;
    const generateur_ch = enums.type_generateur_ch;
    const generateurs_ch_ecs = Object.keys(generateur_ch).reduce((acc, key) => {
      const gen_ch = generateur_ch[key];
      if (Object.values(generateur_ecs).includes(gen_ch)) acc[key] = gen_ch;
      return acc;
    }, {});
    type_generateur = requestInputID(de, du, 'type_generateur_ch', Object.keys(generateurs_ch_ecs));
  } else {
    console.warn("!! usage_generateur n'est pas 'chauffage' ou 'chauffage + ecs' !!");
  }
  return type_generateur;
}

export function calc_generateur_ch(
  dpe,
  gen_ch,
  _pos,
  em_ch,
  cfg_ch,
  bch,
  bch_dep,
  GV,
  Sh,
  hsp,
  ca_id,
  zc_id,
  ac,
  ilpa
) {
  const de = gen_ch.donnee_entree;
  const du = gen_ch.donnee_utilisateur || {};
  const di = gen_ch.donnee_intermediaire || {};

  const combustion_ids = tvColumnIDs('generateur_combustion', 'type_generateur_ch');
  const pac_ids = tvColumnIDs('scop', 'type_generateur_ch');

  const usage_generateur = requestInput(de, du, 'usage_generateur');
  const type_gen_ch_id = type_generateur_ch(di, de, du, usage_generateur);

  let isPacGenerator = pac_ids.includes(type_gen_ch_id);
  let isCombustionGenerator = combustion_ids.includes(type_gen_ch_id);

  /**
   * Pour le type de chauffage 119 - système collectif par défaut en abscence d'information : chaudière fioul pénalisante,
   * détection en fonction des données d'entrées du type de générateur pour calculer les rendements de l'installation
   *
   * Si présence de tv_generateur_combustion_id dans les données d'entrée alors générateur à combustion
   * Si présence de tv_scop_id dans les données d'entrée alors générateur pompe à chaleur
   */
  if (type_gen_ch_id === '119') {
    isPacGenerator = false;
    isCombustionGenerator = false;

    if (de.tv_generateur_combustion_id) {
      const row = tv('generateur_combustion', {
        tv_generateur_combustion_id: de.tv_generateur_combustion_id
      });

      if (row) {
        // On prend par défaut le premier type de générateur pour effectuer les calculs de rendement
        const typeGenerateurCh = row.enum_type_generateur_ch_id?.split('|');

        if (typeGenerateurCh && typeGenerateurCh.length) {
          de.enum_type_generateur_ch_id = typeGenerateurCh[0];
        }
      }

      isCombustionGenerator = true;
    } else if (de.tv_scop_id) {
      isPacGenerator = true;
    } else {
      const row = tv('rendement_generation', {
        tv_rendement_generation_id: de.tv_rendement_generation_id
      });

      if (row) {
        // On prend par défaut le premier type de générateur pour effectuer les calculs de rendement
        const typeGenerateurCh = row.enum_type_generateur_ch_id?.split('|');

        if (typeGenerateurCh && typeGenerateurCh.length) {
          de.enum_type_generateur_ch_id = typeGenerateurCh[0];
        }
      }
    }
  }

  if (isPacGenerator) {
    let em;

    // Si un seul émetteur de chauffage décrit, on considère que cet émetteur est relié au générateur de chauffage
    if (em_ch.length === 1) {
      em = em_ch[0];
    } else {
      const gen_lge_id = requestInputID(de, du, 'lien_generateur_emetteur');
      em = em_ch.find((em) => em.donnee_entree.enum_lien_generateur_emetteur_id === gen_lge_id);
    }

    if (em) {
      const ed_id = em.donnee_entree.enum_type_emission_distribution_id;
      scopOrCop(di, de, du, zc_id, ed_id, 'ch');
    } else {
      console.error(
        `Emetteur de chauffage non trouvé pour le générateur ${de.description}, les valeurs intermédiaires saisies sont prises en compte`
      );

      di.rg = di.scop || di.cop;
      di.rg_dep = di.scop || di.cop;
    }
  } else if (isCombustionGenerator) {
    calc_generateur_combustion_ch(dpe, di, de, du, em_ch, GV, ca_id, zc_id, ac);
  } else {
    tv_rendement_generation(di, de, du);
  }

  conso_aux_gen(di, de, 'ch', bch, bch_dep);

  /**
   * 15 Calcul des consommations d’auxiliaires des installations de chauffage (Caux_ch) et d’ECS (Caux_ecs)
   *
   * Les consommations des auxiliaires de distribution de chauffage et d’ECS sont prises nulles pour les installations
   * individuelles en l’absence d’un circulateur externe au générateur. On exclut donc les générateurs suivants :
   *
   * >= 4 - exclusion des PAC air / air
   * >= 20 && <= 47 - exclusion des poêles
   * 53, 54 - exclusion des radiateurs gaz
   * >= 98 && <= 105 - exclusion des émetteurs à effet joule, radiateurs électriques, plafonds / planchers électriques
   *
   */
  if (
    de.enum_type_generateur_ch_id >= 106 ||
    (de.enum_type_generateur_ch_id >= 55 && de.enum_type_generateur_ch_id <= 97) ||
    [48, 49, 50, 51, 52].includes(de.enum_type_generateur_ch_id) ||
    (de.enum_type_generateur_ch_id >= 4 && de.enum_type_generateur_ch_id <= 19)
  ) {
    conso_aux_distribution_ch(em_ch, di, Sh, zc_id, ca_id, ilpa, GV);
  }

  conso_ch(di, de, du, _pos, cfg_ch, em_ch, GV, Sh, hsp, bch, bch_dep);

  gen_ch.donnee_intermediaire = di;
  gen_ch.donnee_utilisateur = du;
}
