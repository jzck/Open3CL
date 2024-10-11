import enums from './enums.js';
import { tv, tvColumnIDs, requestInput, requestInputID, Tbase } from './utils.js';
import { tv_scop } from './12.4_pac.js';
import { tv_generateur_combustion } from './13.2_generateur_combustion.js';
import { conso_aux_gen } from './15_conso_aux.js';

function tv_pertes_stockage(di, de) {
  let vb;
  if (de.volume_stockage <= 100) vb = '≤ 100';
  else if (de.volume_stockage <= 200) vb = '100 <   ≤ 200';
  else if (de.volume_stockage <= 300) vb = '200 <   ≤ 300';
  else vb = '> 300';

  const matcher = {
    enum_type_generateur_ecs_id: de.enum_type_generateur_ecs_id,
    volume_ballon: vb
  };

  const row = tv('pertes_stockage', matcher);
  if (row) {
    di.cr = Number(row.cr);
    de.tv_pertes_stockage_id = Number(row.tv_pertes_stockage_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour cr !!');
  }
}

// 15.2.3
export function calc_Qdw_j(instal_ecs, becs_j) {
  const de = instal_ecs.donnee_entree;
  const du = instal_ecs.donnee_utilisateur || {};

  const type_installation = requestInput(de, du, 'type_installation');

  let Qdw_j;
  if (type_installation === 'installation individuelle') {
    const Sh = de.surface_habitable;
    const Rat_ecs = 1;
    const Lvc = 0.2 * Sh * Rat_ecs;
    Qdw_j = ((0.5 * Lvc) / Sh) * becs_j;
  } else if (type_installation === 'installation collective') {
    Qdw_j = (0.028 + 0.112) * becs_j;
  } else {
    console.warn(`!! calc_Qdw_j: ${type_installation} non pris en compte !!`);
  }

  instal_ecs.donnee_utilisateur = du;
  return Qdw_j;
}

function calc_Qgw(di, de, du) {
  const type_stockage_ecs = requestInput(de, du, 'type_stockage_ecs');

  // stockage
  if (type_stockage_ecs === "abscence de stockage d'ecs (production instantanée)") {
    di.Qgw = 0;
  }
  const Vs = requestInput(de, du, 'volume_stockage', 'float');
  const gen_ecs_elec_ids = tvColumnIDs('pertes_stockage', 'type_generateur_ecs');
  if (gen_ecs_elec_ids.includes(de.enum_type_generateur_ecs_id)) {
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
  const rg =
    1 / (1 / di.rpn + 1790 * (di.qp0 / (besoin_ecs * 1000)) + 6970 * (di.pveil / besoin_ecs));
  di.rendement_generation = rg;
  return rg;
}

function rgrs_chaudiere(di, besoin_ecs) {
  const rgrs =
    1 /
    (1 / di.rpn +
      (1790 * di.qp0 + di.Qgw) / (besoin_ecs * 1000) +
      (6970 * 0.5 * di.pveil) / (besoin_ecs * 1000));
  return rgrs;
}

function rg_accumulateur_gaz(di, besoin_ecs) {
  const rg =
    1 /
    (1 / di.rpn + (8592 * di.qp0 + di.Qgw) / (besoin_ecs * 1000) + (6970 * di.pveil) / besoin_ecs);
  return rg;
}

export default function calc_gen_ecs(gen_ecs, ecs_di, GV, ca_id, zc_id) {
  const de = gen_ecs.donnee_entree;
  const di = gen_ecs.donnee_intermediaire || {};
  const du = {};

  const usage_generateur = requestInput(de, du, 'usage_generateur');
  const type_generateur_id = type_generateur_ecs(di, de, du, usage_generateur);
  const type_energie = requestInput(de, du, 'type_energie');

  calc_Qgw(di, de, du, ecs_di);

  const pac_ids = tvColumnIDs('scop', 'type_generateur_ch');
  const combustion_ids = tvColumnIDs('generateur_combustion', 'type_generateur_ecs');
  let Iecs, Iecs_dep;
  if (pac_ids.includes(type_generateur_id)) {
    tv_scop(di, de, du, zc_id, null, 'ecs');
    const cop = di.scop ? di.scop : di.cop;
    Iecs = 1 / cop;
    Iecs_dep = 1 / cop;
  } else if (type_energie === 'électricité') {
    const rd = ecs_di.rendement_distribution;
    di.rendement_stockage = 1 / (1 + (di.Qgw * rd) / (ecs_di.besoin_ecs * 1000));
    di.rendement_stockage_depensier =
      1 / (1 + (di.Qgw * rd) / (ecs_di.besoin_ecs_depensier * 1000));
    const type_generateur = enums.type_generateur_ecs[type_generateur_id];
    if (type_generateur === 'ballon électrique à accumulation vertical catégorie c ou 3 étoiles') {
      di.rendement_stockage *= 1.08;
      di.rendement_stockage_depensier *= 1.08;
    }
    Iecs = 1 / di.rendement_stockage;
    Iecs_dep = 1 / di.rendement_stockage_depensier;
  } else if (combustion_ids.includes(type_generateur_id)) {
    const ca = enums.classe_altitude[ca_id];
    const zc = enums.zone_climatique[zc_id];
    const tbase = Tbase[ca][zc.slice(0, 2)];
    tv_generateur_combustion(di, de, du, 'ecs', GV, tbase);
    const besoin_ecs = ecs_di.besoin_ecs * di.ratio_besoin_ecs;
    const besoin_ecs_dep = ecs_di.besoin_ecs_depensier * di.ratio_besoin_ecs;

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
      if (di.Qgw == 0) {
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
    } else if (type_generateur.includes('accumulateur gaz')) {
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
  conso_aux_gen(di, de, 'ecs', ecs_di.besoin_ecs, ecs_di.besoin_ecs_depensier);

  const rd = ecs_di.rendement_distribution;
  Iecs = Iecs / rd;
  Iecs_dep = Iecs_dep / rd;

  di.ratio_besoin_ecs = 1;
  di.conso_ecs = ecs_di.besoin_ecs * Iecs;
  di.conso_ecs_depensier = ecs_di.besoin_ecs_depensier * Iecs_dep;

  gen_ecs.donnee_intermediaire = di;
  gen_ecs.donnee_utilisateur = du;
}
