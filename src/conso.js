import enums from './enums.js';
import calc_conso_eclairage from './16_conso_eclairage.js';
import tvs from './tv.js';

const coef_ep = {
  'électricité ch': 2.3,
  'électricité ecs': 2.3,
  'électricité fr': 2.3,
  'électricité éclairage': 2.3,
  'électricité auxiliaire': 2.3
};

// 31 mars 2021
// https://www.legifrance.gouv.fr/download/pdf?id=doxMrRr0wbfJVvtWjfDP4gHzzERt1iX0PtobthCE6A0=
const coef_ges = {
  'bois – bûches': 0.03,
  'bois – granulés (pellets) ou briquettes': 0.03,
  'bois – plaquettes forestières': 0.024,
  'bois – plaquettes d’industrie': 0.024,
  'gaz naturel': 0.227,
  'fioul domestique': 0.324,
  charbon: 0.385,
  propane: 0.272,
  butane: 0.272,
  gpl: 0.272,
  "électricité d'origine renouvelable utilisée dans le bâtiment": 0,
  'électricité ch': 0.079,
  'électricité ecs': 0.065,
  'électricité fr': 0.064,
  'électricité éclairage': 0.069,
  'électricité auxiliaire': 0.064
};

// annexe 7
// https://www.legifrance.gouv.fr/download/file/doxMrRr0wbfJVvtWjfDP4qE7zNsiFZL-4wqNyqoY-CA=/JOE_TEXTE
const coef_cout = {
  'fioul domestique': 0.09142,
  'réseau de chauffage urbain': 0.0787,
  propane: 0.14305,
  butane: 0.20027,
  charbon: 0.02372,
  'bois – granulés (pellets) ou briquettes': 0.05991,
  'bois – bûches': 0.03201,
  'bois – plaquettes forestières': 0.03201,
  'bois – plaquettes d’industrie': 0.03201,
  // https://www.legifrance.gouv.fr/download/pdf?id=7hpbVyq228foxHzNM7WleDImAyXlPNb9zULelSY01V8=
  'gaz naturel': cout_gaz_naturel,
  "électricité d'origine renouvelable utilisée dans le bâtiment": cout_electricite,
  'électricité ch': cout_electricite,
  'électricité ecs': cout_electricite,
  'électricité fr': cout_electricite,
  'électricité éclairage': cout_electricite,
  'électricité auxiliaire': cout_electricite
};

/**
 * Fonction utilitaire pour générer la clef à utiliser pour la table `coef_ges`.
 * Le type_energie 'électricté' nécessite un suffixe : en fonction la destination d'usage,
 * le coefficient est différent.
 *
 * @param type_energie {string} label de l'enum type_energie
 * @param destination {'ch' | 'ecs' | 'éclairage'}
 * @return {string} la clef à utiliser pour récupérer le coefficient depuis la table `coef_ges`
 */
function getCoefKey(type_energie, destination) {
  if (type_energie === 'électricité') {
    if (!['ch', 'ecs', 'éclairage'].includes(destination)) {
      console.error(`Type d'électricité inconnu: ${destination}`);
    }
    return `électricité ${destination}`;
  }
  return type_energie;
}

function cout_gaz_naturel(cef) {
  if (cef < 5009) return 0.11121 * cef;
  else if (cef < 50055) return 230 + 0.06533 * cef;
  else return 415 + 0.06164 * cef;
}

function cout_electricite(cef) {
  if (cef < 1000) return 0.29007 * cef;
  else if (cef < 2500) return 149 + 0.14066 * cef;
  else if (cef < 5000) return 122 + 0.15176 * cef;
  else if (cef < 15000) return 94 + 0.15735 * cef;
  else return 56 + 0.15989 * cef;
}

function getConso(coef, type_energie, conso) {
  // is coef is a function, execute it
  if (!coef) return conso;
  const coef_val = coef[type_energie];
  if (typeof coef_val === 'function') {
    const val = coef_val(conso);
    return val;
  }
  if (coef_val) return coef_val * conso;
  return conso;
}

export default function calc_conso(
  Sh,
  zc_id,
  ca_id,
  vt,
  ch,
  ecs,
  fr,
  prorataECS,
  prorataChauffage
) {
  const gen_ch = ch.reduce((acc, ch) => {
    const generateur_chauffage = ch.generateur_chauffage_collection.generateur_chauffage;
    generateur_chauffage.forEach((value) => {
      // S'il existe une clé de repartition de chauffage, utilisation de celle-ci pour répartir la conso chauffage collectif à l'appartement
      if (ch.donnee_entree.cle_repartition_ch === 1) {
        value.donnee_entree.cle_repartition_ch = prorataChauffage;
      } else {
        value.donnee_entree.cle_repartition_ch =
          ch.donnee_entree.cle_repartition_ch || prorataChauffage;
      }
      value.donnee_entree.enum_type_installation_id = ch.donnee_entree.enum_type_installation_id;
    });
    return acc.concat(generateur_chauffage);
  }, []);

  const gen_ecs = ecs.reduce((acc, ecs) => {
    const generateur_ecs = ecs.generateur_ecs_collection.generateur_ecs;
    if (prorataECS === 1) {
      // S'il existe une clé de repartition ECS, utilisation de celle-ci pour répartir la conso ECS collective à l'appartement
      generateur_ecs.forEach(
        (value) =>
          (value.donnee_entree.cle_repartition_ecs =
            (ecs.donnee_entree.cle_repartition_ecs || 1) * (ecs.donnee_entree.rdim || 1))
      );
    }
    return acc.concat(generateur_ecs);
  }, []);

  const ret = {
    ef_conso: calc_conso_pond(
      Sh,
      zc_id,
      vt,
      gen_ch,
      gen_ecs,
      fr,
      'conso',
      null,
      prorataECS,
      prorataChauffage
    ),
    ep_conso: calc_conso_pond(
      Sh,
      zc_id,
      vt,
      gen_ch,
      gen_ecs,
      fr,
      'ep_conso',
      coef_ep,
      prorataECS,
      prorataChauffage
    ),
    emission_ges: calc_conso_pond(
      Sh,
      zc_id,
      vt,
      gen_ch,
      gen_ecs,
      fr,
      'emission_ges',
      coef_ges,
      prorataECS,
      prorataChauffage
    ),
    cout: calc_conso_pond(
      Sh,
      zc_id,
      vt,
      gen_ch,
      gen_ecs,
      fr,
      'cout',
      coef_cout,
      prorataECS,
      prorataChauffage
    )
  };
  ret.ep_conso.classe_bilan_dpe = classe_bilan_dpe(
    ret.ep_conso.ep_conso_5_usages_m2,
    zc_id,
    ca_id,
    Sh
  );
  ret.emission_ges.classe_emission_ges = classe_emission_ges(
    ret.emission_ges.emission_ges_5_usages_m2,
    zc_id,
    ca_id,
    Sh
  );

  const energie_ids = [];
  // find all type_energies in gen_ch and gen_ecs
  gen_ch.forEach((gen_ch) => {
    const id = gen_ch.donnee_entree.enum_type_energie_id;
    if (!energie_ids.includes(id)) energie_ids.push(id);
  });
  gen_ecs.forEach((gen_ecs) => {
    const id = gen_ecs.donnee_entree.enum_type_energie_id;
    if (!energie_ids.includes(id)) energie_ids.push(id);
  });
  if (!energie_ids.includes('1')) energie_ids.push('1');
  // calculate calc_conso_pond for each energy type
  ret.sortie_par_energie_collection = {};
  ret.sortie_par_energie_collection.sortie_par_energie = energie_ids.reduce((acc, energie_id) => {
    const type_energie = enums.type_energie[energie_id];
    let vt_en, fr_en;
    if (type_energie === 'électricité') {
      vt_en = vt;
      fr_en = fr;
    } else {
      vt_en = [];
      fr_en = [];
    }
    const gen_ch_en = gen_ch.filter(
      (gen_ch) => gen_ch.donnee_entree.enum_type_energie_id === energie_id
    );
    const gen_ecs_en = gen_ecs.filter(
      (gen_ecs) => gen_ecs.donnee_entree.enum_type_energie_id === energie_id
    );
    let conso_en = calc_conso_pond(Sh, zc_id, vt_en, gen_ch_en, gen_ecs_en, fr_en, '', null);
    conso_en = {
      conso_ch: conso_en._ch,
      conso_ecs: conso_en._ecs,
      conso_5_usages: conso_en._5_usages,
      emission_ges_ch: conso_en._ch * coef_ges[getCoefKey(type_energie, 'ch')],
      emission_ges_ecs: conso_en._ecs * coef_ges[getCoefKey(type_energie, 'ecs')],
      emission_ges_5_usages: conso_en._5_usages * coef_ges[type_energie] // TODO elec
    };
    conso_en.enum_type_energie_id = energie_id;
    return acc.concat(conso_en);
  }, []);
  return ret;
}

function classe_bilan_dpe(ep_conso_5_usages_m2, zc_id, ca_id, Sh) {
  const ca = enums.classe_altitude[ca_id];

  const cut = tvs.dpe_class_limit[ca][Math.round(Sh)] ?? [];

  if (!ep_conso_5_usages_m2) return null;
  if (ep_conso_5_usages_m2 < (cut['A'] ?? 70)) return 'A';
  if (ep_conso_5_usages_m2 < (cut['B'] ?? 110)) return 'B';
  if (ep_conso_5_usages_m2 < (cut['C'] ?? 180)) return 'C';
  if (ep_conso_5_usages_m2 < (cut['D'] ?? 250)) return 'D';

  const zc = enums.zone_climatique[zc_id];

  if (['h1b', 'h1c', 'h2d'].includes(zc) && ca === 'supérieur à 800m') {
    if (ep_conso_5_usages_m2 < (cut['E'] ?? 390)) return 'E';
    if (ep_conso_5_usages_m2 < (cut['F'] ?? 500)) return 'F';
  } else {
    if (ep_conso_5_usages_m2 < (cut['E'] ?? 330)) return 'E';
    if (ep_conso_5_usages_m2 < (cut['F'] ?? 420)) return 'F';
  }
  return 'G';
}

function classe_emission_ges(emission_ges_5_usages_m2, zc_id, ca_id, Sh) {
  const ca = enums.classe_altitude[ca_id];

  const cut = tvs.ges_class_limit[ca][Math.round(Sh)] ?? [];

  if (!emission_ges_5_usages_m2) return null;
  if (emission_ges_5_usages_m2 < (cut['A'] ?? 6)) return 'A';
  if (emission_ges_5_usages_m2 < (cut['B'] ?? 11)) return 'B';
  if (emission_ges_5_usages_m2 < (cut['C'] ?? 30)) return 'C';
  if (emission_ges_5_usages_m2 < (cut['D'] ?? 50)) return 'D';

  const zc = enums.zone_climatique[zc_id];

  if (['h1b', 'h1c', 'h2d'].includes(zc) && ca === 'supérieur à 800m') {
    if (emission_ges_5_usages_m2 < (cut['E'] ?? 80)) return 'E';
    if (emission_ges_5_usages_m2 < (cut['F'] ?? 110)) return 'F';
  } else {
    if (emission_ges_5_usages_m2 < (cut['E'] ?? 70)) return 'E';
    if (emission_ges_5_usages_m2 < (cut['F'] ?? 100)) return 'F';
  }
  return 'G';
}

/**
 Calcul de la consommation globale d'ECS
 * @param gen_ecs {Generateur_ecs_collection}
 * @param field {string}
 * @param coef {number}
 * @param prorataECS {number}
 * @returns {number}
 */
function getEcsConso(gen_ecs, field, coef, prorataECS) {
  return gen_ecs.reduce((acc, gen_ecs) => {
    const conso = gen_ecs.donnee_intermediaire[field];
    let type_energie = enums.type_energie[gen_ecs.donnee_entree.enum_type_energie_id];
    if (type_energie === 'électricité') type_energie = 'électricité ecs';
    return (
      acc +
      getConso(coef, type_energie, conso) *
        (gen_ecs.donnee_entree.cle_repartition_ecs || prorataECS)
    );
  }, 0);
}

/**
 * Calcul de la consommation globale de chauffage
 * @param gen_ch {Generateur_chauffage_collection}
 * @param field {string}
 * @param coef {number}
 * @param prorataChauffage {number}
 * @returns {number}
 */
function getChauffageConso(gen_ch, field, coef, prorataChauffage) {
  return gen_ch.reduce((acc, gen_ch) => {
    const conso = gen_ch.donnee_intermediaire[field];
    let type_energie = enums.type_energie[gen_ch.donnee_entree.enum_type_energie_id];
    if (type_energie === 'électricité') type_energie = 'électricité ch';

    // La clé de répartition n'est utilisée que dans le cadre des chauffages collectifs
    const repartition =
      gen_ch.donnee_entree.enum_type_installation_id !== '1'
        ? gen_ch.donnee_entree.cle_repartition_ch || prorataChauffage
        : prorataChauffage;

    return acc + getConso(coef, type_energie, conso) * repartition;
  }, 0);
}

function calc_conso_pond(
  Sh,
  zc_id,
  vt_list,
  gen_ch,
  gen_ecs,
  fr_list,
  prefix,
  coef,
  prorataECS,
  prorataChauffage
) {
  const ret = {};
  ret.auxiliaire_ventilation = vt_list.reduce((acc, vt) => {
    const conso = vt.donnee_intermediaire.conso_auxiliaire_ventilation || 0;
    return acc + getConso(coef, 'électricité auxiliaire', conso);
  }, 0);

  const conso_eclairage = calc_conso_eclairage(zc_id) * Sh;
  ret.eclairage = getConso(coef, 'électricité éclairage', conso_eclairage);

  // aux ch
  ret.auxiliaire_generation_ch = gen_ch.reduce((acc, gen_ch) => {
    const conso = gen_ch.donnee_intermediaire.conso_auxiliaire_generation_ch || 0;
    return acc + getConso(coef, 'électricité auxiliaire', conso);
  }, 0);

  ret.auxiliaire_generation_ch_depensier = gen_ch.reduce((acc, gen_ch) => {
    const conso = gen_ch.donnee_intermediaire.conso_auxiliaire_generation_ch_depensier || 0;
    return acc + getConso(coef, 'électricité auxiliaire', conso);
  }, 0);
  ret.auxiliaire_distribution_ch = 0;

  ret.ch = getChauffageConso(gen_ch, 'conso_ch', coef, prorataChauffage);

  ret.ch_depensier = getChauffageConso(gen_ch, 'conso_ch_depensier', coef, prorataChauffage);

  ret.auxiliaire_generation_ecs = gen_ecs.reduce((acc, gen_ecs) => {
    const conso = gen_ecs.donnee_intermediaire.conso_auxiliaire_generation_ecs || 0;
    return acc + getConso(coef, 'électricité auxiliaire', conso);
  }, 0);

  ret.auxiliaire_generation_ecs_depensier = gen_ecs.reduce((acc, gen_ecs) => {
    const conso = gen_ecs.donnee_intermediaire.conso_auxiliaire_generation_ecs_depensier || 0;
    return acc + getConso(coef, 'électricité auxiliaire', conso);
  }, 0);

  ret.auxiliaire_distribution_ecs = 0;

  ret.ecs = getEcsConso(gen_ecs, 'conso_ecs', coef, prorataECS);

  ret.ecs_depensier = getEcsConso(gen_ecs, 'conso_ecs_depensier', coef, prorataECS);

  ret.fr = fr_list.reduce((acc, fr) => {
    const conso = fr.donnee_intermediaire.conso_fr;
    let type_energie = enums.type_energie[fr.donnee_entree.enum_type_energie_id];
    if (type_energie === 'électricité') type_energie = 'électricité fr';
    return acc + getConso(coef, type_energie, conso);
  }, 0);

  ret.fr_depensier = fr_list.reduce((acc, fr) => {
    const conso = fr.donnee_intermediaire.conso_fr_depensier;
    let type_energie = enums.type_energie[fr.donnee_entree.enum_type_energie_id];
    if (type_energie === 'électricité') type_energie = 'électricité fr';
    return acc + getConso(coef, type_energie, conso);
  }, 0);

  let tot_aux;
  if (prefix === 'cout') tot_aux = 'total_auxiliaire';
  else tot_aux = 'totale_auxiliaire';
  ret[tot_aux] =
    ret.auxiliaire_ventilation +
    ret.auxiliaire_generation_ch +
    ret.auxiliaire_generation_ecs +
    ret.auxiliaire_distribution_ch +
    ret.auxiliaire_distribution_ecs;
  ret['5_usages'] = ret.ch + ret.ecs + ret.fr + ret[tot_aux] + ret.eclairage;
  if (prefix !== 'cout') ret['5_usages_m2'] = Math.floor(ret['5_usages'] / Sh);

  // add prefix_ to all ret keys
  Object.keys(ret).forEach((key) => {
    ret[`${prefix}_${key}`] = ret[key];
    delete ret[key];
  });
  return ret;
}
