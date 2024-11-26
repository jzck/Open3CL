import enums from './enums.js';
import {
  bug_for_bug_compat,
  getVolumeStockageFromDescription,
  requestInput,
  requestInputID,
  Tbase,
  tv,
  tvColumnIDs
} from './utils.js';
import {
  tv_generateur_combustion,
  updateGenerateurCombustion
} from './13.2_generateur_combustion.js';
import { conso_aux_gen } from './15_conso_aux.js';
import { scopOrCop } from './12.4_pac.js';

function tv_pertes_stockage(di, de) {
  let vb;
  if (de.volume_stockage <= 100) vb = '≤ 100';
  else if (de.volume_stockage <= 200) vb = '100 <   ≤ 200';
  else if (de.volume_stockage <= 300) vb = '200 <   ≤ 300';
  else vb = '> 300';

  let matcher = {
    enum_type_generateur_ecs_id: de.enum_type_generateur_ecs_id,
    volume_ballon: vb
  };

  if (bug_for_bug_compat && de.enum_type_generateur_ecs_id === '84') {
    matcher = {
      tv_pertes_stockage_id: de.tv_pertes_stockage_id
    };

    console.error(
      `Le générateur ECS est de type '84 - "système collectif par défaut en abscence d'information : chaudière fioul pénalisante"'.
      On ne connait pas le type précis du générateur ECS permettant de récupérer les pertes de stockages. Utilisations de 
      tv_pertes_stockage_id ${de.tv_pertes_stockage_id} saisi.
      `
    );
  }

  const row = tv('pertes_stockage', matcher);
  if (row) {
    di.cr = Number(row.cr);
    de.tv_pertes_stockage_id = Number(row.tv_pertes_stockage_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour cr !!');
  }
}

function tv_facteur_couverture_solaire(di, de, zc_id, th) {
  /**
   * 18.4 Facteur de couverture solaire
   * Les facteurs de couverture solaire peuvent être saisi directement quand ils sont connus et peuvent être justifiés.
   */
  if (de.fecs_saisi) {
    di.fecs = de.fecs_saisi;
    return;
  }

  const matcher = {
    enum_zone_climatique_id: zc_id,
    type_installation_solaire:
      enums.type_installation_solaire[de.enum_type_installation_solaire_id],
    type_batiment: th === 'maison' ? 'maison' : 'immeuble'
  };

  const row = tv('facteur_couverture_solaire', matcher);
  if (row) {
    di.fecs = Number(row.facteur_couverture_solaire);
    de.tv_facteur_couverture_solaire_id = Number(row.tv_facteur_couverture_solaire_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour facteur_couverture_solaire !!');
  }
}

// 15.2.3
export function calc_Qdw_j(instal_ecs, becs_j) {
  const de = instal_ecs.donnee_entree;
  const du = instal_ecs.donnee_utilisateur || {};

  const type_installation = requestInput(de, du, 'type_installation');

  let Qdw_ind_vc_j;
  let Qdw_col_vc_j = 0;

  const Rat_ecs = 1;
  const Lvc = 0.2 * Rat_ecs;

  Qdw_ind_vc_j = 0.5 * Lvc * becs_j;

  if (type_installation.includes('installation collective')) {
    Qdw_col_vc_j = 0.112 * becs_j;
  }

  instal_ecs.donnee_utilisateur = du;
  return Qdw_col_vc_j + Qdw_ind_vc_j;
}

function calc_Qgw(di, de, du, ecs_de) {
  const type_stockage_ecs = requestInput(de, du, 'type_stockage_ecs');

  // stockage
  if (type_stockage_ecs === "abscence de stockage d'ecs (production instantanée)") {
    di.Qgw = 0;
    return;
  }
  let Vs = requestInput(de, du, 'volume_stockage', 'float');
  const gen_ecs_elec_ids = tvColumnIDs('pertes_stockage', 'type_generateur_ecs');

  if (bug_for_bug_compat) {
    /**
     * Dans certains cas, le volume annoncé pour le ballon est proratisé à l'appartement
     * alors qu'il est d'autres fois affiché pour l'immeuble.
     * le volume étant souvent décrit dans la description, on vérifie si le volume a été proratisé
     */
    const VsFromDescription = getVolumeStockageFromDescription(ecs_de.description);

    if (VsFromDescription === Math.round(Number.parseFloat(Vs) / de.ratio_virtualisation)) {
      Vs = VsFromDescription;
    }
  }

  let isElectric = gen_ecs_elec_ids.includes(de.enum_type_generateur_ecs_id);

  /**
   * Si le système ECS est inconnu -> on se base exclusivement sur le type d'énergie
   * enum_type_generateur_ecs_id = 84 - "système collectif par défaut en abscence d'information : chaudière fioul pénalisante"
   */
  if (bug_for_bug_compat && de.enum_type_generateur_ecs_id === '84') {
    isElectric = de.enum_type_energie_id === '1';
  }

  if (isElectric) {
    tv_pertes_stockage(di, de, du);
    di.Qgw = ((8592 * 45) / 24) * Vs * di.cr;
    delete di.cr;
  } else {
    di.Qgw = 67662 * Vs ** 0.55;
  }
}

function type_generateur_ecs(di, de, du, usage_generateur) {
  let type_generateur;
  if (usage_generateur === 'ecs') {
    type_generateur = requestInputID(de, du, 'type_generateur_ecs');
  } else if (usage_generateur === 'chauffage + ecs') {
    const generateur_ecs = enums.type_generateur_ecs;
    const generateur_ch = enums.type_generateur_ch;
    const generateurs_ch_ecs = Object.keys(generateur_ecs).reduce((acc, key) => {
      const gen_ecs = generateur_ecs[key];
      if (Object.values(generateur_ch).includes(gen_ecs)) acc[key] = gen_ecs;
      return acc;
    }, {});
    type_generateur = requestInputID(
      de,
      du,
      'type_generateur_ecs',
      Object.keys(generateurs_ch_ecs)
    );
  } else {
    console.warn("!! usage_generateur n'est pas 'ecs' ou 'chauffage + ecs' !!");
  }
  return type_generateur;
}

function rg_chauffe_eau_gaz(di, besoin_ecs) {
  return (
    1 /
    (1 / di.rpn + 1790 * (di.qp0 / (besoin_ecs * 1000)) + 6970 * (di.pveil / (besoin_ecs * 1000)))
  );
}

function rgrs_chaudiere(di, besoin_ecs) {
  return (
    1 /
    (1 / di.rpn +
      (1790 * di.qp0 + di.Qgw) / (besoin_ecs * 1000) +
      (6970 * 0.5 * di.pveil) / (besoin_ecs * 1000))
  );
}

function rg_accumulateur_gaz(di, besoin_ecs) {
  return (
    1 /
    (1 / di.rpn +
      (8592 * di.qp0 + di.Qgw) / (besoin_ecs * 1000) +
      (6970 * di.pveil) / (besoin_ecs * 1000))
  );
}

function rgrsReseauUrbain(de) {
  if (de.reseau_distribution_isole === 1) {
    return 0.9;
  }
  return 0.75;
}

export default function calc_gen_ecs(dpe, gen_ecs, ecs_di, ecs_de, GV, ca_id, zc_id, th) {
  const de = gen_ecs.donnee_entree;
  const di = gen_ecs.donnee_intermediaire || {};
  const du = {};

  // Ratio de virtualisation à prendre en compte sur le rendement (17.2.1 Génération d’un DPE à l’appartement)
  de.ratio_virtualisation = ecs_de.ratio_virtualisation || 1;

  const besoin_ecs = ecs_di.besoin_ecs;
  const besoin_ecs_dep = ecs_di.besoin_ecs_depensier;

  // Mise à jour du type de générateur si besoin
  // ex: poêles à bois bouilleur -> chaudière bois
  updateGenerateurCombustion(dpe, de, 'ecs');

  const usage_generateur = requestInput(de, du, 'usage_generateur');
  const type_generateur_id = type_generateur_ecs(di, de, du, usage_generateur);
  const type_energie = requestInput(de, du, 'type_energie');

  const pac_ids = tvColumnIDs('scop', 'type_generateur_ecs');
  const combustion_ids = tvColumnIDs('generateur_combustion', 'type_generateur_ecs');

  let isCombustionGenerator = combustion_ids.includes(type_generateur_id);
  let isPacGenerator = pac_ids.includes(type_generateur_id);
  let isReseauChaleur = type_energie === 'réseau de chauffage urbain';
  let isElectric = type_energie === 'électricité';

  /**
   * Pour le type de générateur ECS 84 - système collectif par défaut en abscence d'information : chaudière fioul pénalisante,
   * détection en fonction des données d'entrées du type de générateur pour calculer les rendements de l'installation
   *
   * Si présence de tv_generateur_combustion_id dans les données d'entrée alors générateur à combustion
   * Si présence de tv_scop_id dans les données d'entrée alors générateur pompe à chaleur
   */
  if (type_generateur_id === '84') {
    if (!isElectric && !isReseauChaleur) {
      if (de.tv_generateur_combustion_id) {
        const row = tv('generateur_combustion', {
          tv_generateur_combustion_id: de.tv_generateur_combustion_id
        });

        if (row) {
          // On prend par défaut le premier type de générateur pour effectuer les calculs de rendement
          const typeGenerateurEcs = row.enum_type_generateur_ecs_id?.split('|');

          if (typeGenerateurEcs && typeGenerateurEcs.length) {
            de.enum_type_generateur_ecs_id = typeGenerateurEcs[0];
          }
        }

        isCombustionGenerator = true;
      } else if (de.tv_scop_id) {
        isPacGenerator = true;
      }
    }
  }

  calc_Qgw(di, de, du, ecs_de);

  /**
   * Application du ratio uniquement pour les installations collectives
   */
  if (ecs_de.enum_type_installation_id !== '1') {
    di.Qgw *= de.ratio_virtualisation;
  }
  let Iecs, Iecs_dep;

  if (isPacGenerator) {
    scopOrCop(di, de, du, zc_id, null, 'ecs');

    const cop = di.scop || di.cop;
    Iecs = 1 / cop;
    Iecs_dep = 1 / cop;
  } else if (isElectric) {
    const rd = ecs_di.rendement_distribution;
    di.rendement_stockage = 1 / (1 + (di.Qgw * rd) / (besoin_ecs * 1000));
    di.rendement_stockage_depensier = 1 / (1 + (di.Qgw * rd) / (besoin_ecs_dep * 1000));
    const type_generateur = enums.type_generateur_ecs[type_generateur_id];
    if (type_generateur === 'ballon électrique à accumulation vertical catégorie c ou 3 étoiles') {
      di.rendement_stockage *= 1.08;
      di.rendement_stockage_depensier *= 1.08;
    }
    Iecs = 1 / di.rendement_stockage;
    Iecs_dep = 1 / di.rendement_stockage_depensier;
  } else if (isReseauChaleur) {
    if (bug_for_bug_compat) {
      if (di.rendement_generation_stockage === 0.9 && ecs_de.reseau_distribution_isole === 0) {
        ecs_de.reseau_distribution_isole = 1;
        console.warn(
          `Correction reseau_distribution_isole pour le générateur ECS (1 au lieu de 0 en fonction de la valeur de rendement_generation_stockage saisi)`
        );
      }
    }

    di.rendement_generation_stockage = rgrsReseauUrbain(ecs_de);
    di.rendement_generation_stockage_depensier = rgrsReseauUrbain(ecs_de);

    Iecs = 1 / di.rendement_generation_stockage;
    Iecs_dep = 1 / di.rendement_generation_stockage_depensier;
  } else if (isCombustionGenerator) {
    const ca = enums.classe_altitude[ca_id];
    const zc = enums.zone_climatique[zc_id];
    const tbase = Tbase[ca][zc.slice(0, 2)];

    const methodeSaisie = parseInt(de.enum_methode_saisie_carac_sys_id);
    tv_generateur_combustion(di, de, du, 'ecs', GV, tbase, methodeSaisie);

    if (bug_for_bug_compat) {
      if (di.qp0 < 1) {
        di.qp0 *= 1000;
        console.warn(`Correction di.qp0 pour le générateur ECS. Passage de la valeur en W`);
      }
    }

    // La puissance de la veilleuse est à prendre en compte seulement si elle est présente dans l'installation
    if (!di.pveilleuse) {
      di.pveil = 0;
    }

    const type_generateur = enums.type_generateur_ecs[type_generateur_id];
    if (
      type_generateur.includes('chauffe-eau gaz') ||
      type_generateur.includes('chauffe-eau gpl/propane/butane')
    ) {
      di.rendement_generation = rg_chauffe_eau_gaz(di, besoin_ecs);
      di.rendement_generation_depensier = rg_chauffe_eau_gaz(di, besoin_ecs_dep);
      Iecs = 1 / di.rendement_generation;
      Iecs_dep = 1 / di.rendement_generation_depensier;
    } else if (type_generateur.includes('chaudière')) {
      if (di.Qgw === 0) {
        di.rendement_generation = rgrs_chaudiere(di, besoin_ecs);
        di.rendement_generation_depensier = rgrs_chaudiere(di, besoin_ecs_dep);
        Iecs = 1 / di.rendement_generation;
        Iecs_dep = 1 / di.rendement_generation_depensier;
      } else {
        di.rendement_generation_stockage = rgrs_chaudiere(di, besoin_ecs);
        di.rendement_generation_stockage_depensier = rgrs_chaudiere(di, besoin_ecs_dep);
        Iecs = 1 / di.rendement_generation_stockage;
        Iecs_dep = 1 / di.rendement_generation_stockage_depensier;
      }
    } else if (
      type_generateur.includes('accumulateur gaz') ||
      type_generateur.includes('accumulateur gpl/propane/butane')
    ) {
      di.rendement_generation = rg_accumulateur_gaz(di, besoin_ecs);
      di.rendement_generation_depensier = rg_accumulateur_gaz(di, besoin_ecs_dep);
      Iecs = 1 / di.rendement_generation;
      Iecs_dep = 1 / di.rendement_generation_depensier;
    } else {
      console.warn(`!! type_generateur_ecs ${type_generateur} non implémenté !!`);
    }
  } else {
    Iecs = 1;
    Iecs_dep = 1;
  }
  conso_aux_gen(di, de, 'ecs', besoin_ecs, besoin_ecs_dep);

  const rd = ecs_di.rendement_distribution;
  Iecs = Iecs / rd;
  Iecs_dep = Iecs_dep / rd;

  // Système ECS avec solaire (paragraphe 11.3 de la doc Méthode de calcul 3CL-DPE 2021)
  if (ecs_de.enum_type_installation_solaire_id) {
    tv_facteur_couverture_solaire(ecs_di, ecs_de, zc_id, th);

    di.conso_ecs = ecs_di.besoin_ecs * (1 - ecs_di.fecs) * Iecs;
    di.conso_ecs_depensier = ecs_di.besoin_ecs_depensier * (1 - ecs_di.fecs) * Iecs_dep;
  } else {
    di.conso_ecs = besoin_ecs * Iecs;
    di.conso_ecs_depensier = besoin_ecs_dep * Iecs_dep;
  }

  gen_ecs.donnee_intermediaire = di;
  gen_ecs.donnee_utilisateur = du;
}
