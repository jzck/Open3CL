import enums from './enums.js';
import { tv, tvColumnIDs, requestInput, requestInputID } from './utils.js';
import { tv_scop } from './12.4_pac.js';
import { conso_aux_gen } from './15_conso_aux.js';
import { conso_ch } from './9_conso_ch.js';
import { calc_generateur_combustion_ch } from './13.2_generateur_combustion_ch.js';

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
  ac
) {
  const de = gen_ch.donnee_entree;
  const du = gen_ch.donnee_utilisateur || {};
  const di = gen_ch.donnee_intermediaire || {};

  const usage_generateur = requestInput(de, du, 'usage_generateur');
  const type_gen_ch_id = type_generateur_ch(di, de, du, usage_generateur);

  const combustion_ids = tvColumnIDs('generateur_combustion', 'type_generateur_ch');
  const pac_ids = tvColumnIDs('scop', 'type_generateur_ch');
  if (pac_ids.includes(type_gen_ch_id)) {
    const gen_lge_id = requestInputID(de, du, 'lien_generateur_emetteur');
    const em = em_ch.find((em) => em.donnee_entree.enum_lien_generateur_emetteur_id === gen_lge_id);
    if (!em) {
      console.error(`Emetteur non trouvé pour le générateur ${de.description}, lien=${gen_lge_id}`);
    }
    const ed_id = em.donnee_entree.enum_type_emission_distribution_id;

    /**
     * Si la méthode de saisie est "6 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système thermodynamique : scop/cop/eer"
     */
    if (de.enum_methode_saisie_carac_sys_id === '6') {
      di.rg = di.scop || di.cop;
      di.rg_dep = di.scop || di.cop;
    } else {
      tv_scop(di, de, du, zc_id, ed_id, 'ch');
    }
  } else if (combustion_ids.includes(type_gen_ch_id)) {
    /**
     * Si la méthode de saisie n'est pas "Valeur forfaitaire" mais "saisies"
     * Documentation 3CL : "Pour les installations récentes ou recommandées, les caractéristiques réelles des chaudières présentées sur les bases
     * de données professionnelles peuvent être utilisées."
     */
    if (de.enum_methode_saisie_carac_sys_id === '1' || !di.rendement_generation) {
      calc_generateur_combustion_ch(di, de, du, em_ch, GV, ca_id, zc_id, ac);
    } else {
      di.rg = di.rendement_generation;
      di.rg_dep = di.rendement_generation;
    }
  } else {
    tv_rendement_generation(di, de, du);
  }

  conso_aux_gen(di, de, 'ch', bch, bch_dep);
  conso_ch(di, de, du, _pos, cfg_ch, em_ch, GV, Sh, hsp, bch, bch_dep);

  gen_ch.donnee_intermediaire = di;
  gen_ch.donnee_utilisateur = du;
}
