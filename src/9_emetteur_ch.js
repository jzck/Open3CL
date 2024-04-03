import { tv } from './utils.js';

export function rendement_emission(em) {
  const re = em.donnee_intermediaire.rendement_emission;
  const rd = em.donnee_intermediaire.rendement_distribution;
  const rr = em.donnee_intermediaire.rendement_regulation;
  const rendement_em = re * rd * rr;
  return rendement_em;
}

function tv_rendement_distribution_ch(di, de) {
  const matcher = {
    enum_type_emission_distribution_id: de.enum_type_emission_distribution_id,
    reseau_distribution_isole: de.reseau_distribution_isole
  };
  const row = tv('rendement_distribution_ch', matcher, de);
  if (row) {
    di.rendement_distribution = Number(row.rd);
    de.tv_rendement_distribution_ch_id = Number(row.tv_rendement_distribution_ch_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour rendement_distribution_ch !!');
  }
}

function tv_rendement_emission(di, de) {
  const matcher = {
    enum_type_emission_distribution_id: de.enum_type_emission_distribution_id
  };
  const row = tv('rendement_emission', matcher, de);
  if (row) {
    di.rendement_emission = Number(row.re);
    de.tv_rendement_emission_id = Number(row.tv_rendement_emission_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour rendement_emission !!');
  }
}

function tv_rendement_regulation(di, de) {
  const matcher = {
    enum_type_emission_distribution_id: de.enum_type_emission_distribution_id
  };
  const row = tv('rendement_regulation', matcher, de);
  if (row) {
    di.rendement_regulation = Number(row.rr);
    de.tv_rendement_regulation_id = Number(row.tv_rendement_regulation_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour rendement_regulation !!');
  }
}

function tv_intermittence(di, de, inst_ch_de, map_id, inertie_id) {
  const matcher = {
    enum_methode_application_dpe_log_id: map_id,
    enum_type_installation_id: inst_ch_de.enum_type_installation_id,
    enum_type_chauffage_id: de.enum_type_chauffage_id,
    enum_equipement_intermittence_id: de.enum_equipement_intermittence_id,
    enum_type_regulation_id: de.enum_type_regulation_id,
    enum_type_emission_distribution_id: de.enum_type_emission_distribution_id,
    enum_classe_inertie_id: inertie_id,
    /* TODO */
    comptage_individuel: 'Absence'
  };
  const row = tv('intermittence', matcher, de);
  if (row) {
    di.i0 = Number(row.i0);
    de.tv_intermittence_id = Number(row.tv_intermittence_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour intermittence !!');
  }
}

export function calc_emetteur_ch(em_ch, inst_ch_de, map_id, inertie_id) {
  const de = em_ch.donnee_entree;
  const di = {};
  const du = {};

  tv_rendement_distribution_ch(di, de);
  tv_rendement_emission(di, de);
  tv_rendement_regulation(di, de);
  tv_intermittence(di, de, inst_ch_de, map_id, inertie_id);

  em_ch.donnee_intermediaire = di;
  em_ch.donnee_utilisateur = du;
}
