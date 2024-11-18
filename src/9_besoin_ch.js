import enums from './enums.js';
import tvs from './tv.js';
import { calc_Qdw_j } from './14_generateur_ecs.js';
import { calc_besoin_ecs_j } from './11_besoin_ecs.js';
import { calc_Qrec_gen_j } from './9_generateur_ch.js';
import { calc_ai_j, calc_as_j } from './6.1_apport_gratuit.js';
import { calc_sse_j } from './6.2_surface_sud_equivalente.js';
import { mois_liste, Njj, Njj_sum } from './utils.js';

export default function calc_besoin_ch(
  ilpa,
  ca_id,
  zc_id,
  inertie_id,
  Sh,
  GV,
  nadeq,
  instal_ecs,
  instal_ch,
  bv
) {
  const ca = enums.classe_altitude[ca_id];
  const zc = enums.zone_climatique[zc_id];
  const inertie = enums.classe_inertie[inertie_id];

  let besoin_ch = 0;
  let besoin_ch_depensier = 0;

  const dh21 = tvs.dh21[ilpa];
  const dh19 = tvs.dh19[ilpa];
  const Nref21 = tvs.nref21[ilpa];
  const Nref19 = tvs.nref19[ilpa];

  let sumNref19 = 0;
  let sumNref21 = 0;
  let QrecDistr = 0;
  let QrecDistrDepensier = 0;
  const e = tvs.e[ilpa];

  let pertes_distribution_ecs_recup = 0;
  let pertes_distribution_ecs_recup_depensier = 0;
  let pertes_stockage_ecs_recup = 0;
  let pertes_stockage_ecs_recup_depensier = 0;
  let pertes_generateur_ch_recup = 0;
  let pertes_generateur_ch_recup_depensier = 0;
  let fraction_apport_gratuit_ch = 0;
  let fraction_apport_gratuit_depensier_ch = 0;

  const Qgw_total = instal_ecs.reduce((acc, instal_ecs) => {
    const gen_ecs = instal_ecs.generateur_ecs_collection.generateur_ecs;

    // 17.2.1.1 Calcul des consommations de chauffage, de refroidissement, d’ECS et d’auxiliaires
    // Pour les installations ECS collectives, pas de récupération de stockage d'ECS
    if (Number.parseInt(instal_ecs.donnee_entree.enum_type_installation_id) !== 1) {
      return acc;
    }

    return (
      acc +
      gen_ecs.reduce((acc, gen_ecs) => {
        // Pas de récupération de stockage si le ballon est hors volume chauffé
        if (
          gen_ecs.donnee_entree.position_volume_chauffe_stockage === 0 ||
          gen_ecs.donnee_entree.position_volume_chauffe === 0
        ) {
          return acc;
        }

        return acc + (gen_ecs.donnee_intermediaire.Qgw || 0);
      }, 0)
    );
  }, 0);

  /**
   * 11.4 Plusieurs systèmes d’ECS (limité à 2 systèmes différents par logement)
   * Les besoins en ECS pour chaque générateur sont / 2
   */
  const prorataEcs = instal_ecs.length > 1 ? 0.5 : 1;

  /**
   * Création de la liste des générateurs de chauffage pour lesquels il y a une récupération d'énergie
   *
   * 9.1.1 - Pertes récupérées de génération pour le chauffage sur le mois j (Wh)
   * Ce calcul ne s’applique qu’au générateur pour lesquels des pertes à l’arrêt Qp0 sont prises en compte.
   * Seules les pertes des générateurs et des ballons de stockage en volume chauffé sont récupérables. Les pertes
   * récupérées des générateurs d’air chaud sont nulles.
   *
   * @type {GenerateurChauffageItem[]}
   */
  const gen_ch_recup = instal_ch.flatMap((inst_ch) =>
    inst_ch.generateur_chauffage_collection.generateur_chauffage.filter(
      (gen_ch) =>
        gen_ch.donnee_intermediaire.qp0 && (gen_ch.donnee_entree.position_volume_chauffe ?? 0)
    )
  );

  for (const mois of mois_liste) {
    const nref19 = Nref19[ca][mois][zc];
    const nref21 = Nref21[ca][mois][zc];

    const Qrec_stock_19 = (0.48 * nref19 * Qgw_total) / (24 * 365);
    const Qrec_stock_21 = (0.48 * nref21 * Qgw_total) / (24 * 365);
    pertes_stockage_ecs_recup += Qrec_stock_19 / 1000;
    pertes_stockage_ecs_recup_depensier += Qrec_stock_21 / 1000;

    // pertes distribution
    const becs_j = calc_besoin_ecs_j(ca, mois, zc, nadeq, false) * prorataEcs;
    const becs_j_dep = calc_besoin_ecs_j(ca, mois, zc, nadeq, true) * prorataEcs;
    sumNref19 += nref19;
    sumNref21 += nref21;

    QrecDistr += instal_ecs.reduce((acc, ecs) => acc + calc_Qdw_j(ecs, becs_j), 0);
    QrecDistrDepensier += instal_ecs.reduce((acc, ecs) => acc + calc_Qdw_j(ecs, becs_j_dep), 0);

    // bvj
    const dh19j = dh19[ca][mois][zc];
    const dh21j = dh21[ca][mois][zc];
    const aij = calc_ai_j(Sh, nadeq, nref19);
    const aij_dep = calc_ai_j(Sh, nadeq, nref21);
    const ssej = calc_sse_j(bv, zc, mois);
    const ej = e[ca][mois][zc];
    const asj = calc_as_j(ssej, ej);
    const Fj = calc_Fj(GV, asj, aij, dh19j, inertie);
    const Fj_dep = calc_Fj(GV, asj, aij_dep, dh21j, inertie);
    fraction_apport_gratuit_ch += Fj * Njj[mois];
    fraction_apport_gratuit_depensier_ch += Fj_dep * Njj[mois];
    const bvj = dh19j === 0 ? 0 : calc_bvj(GV, Fj);
    const bvj_dep = dh21j === 0 ? 0 : calc_bvj(GV, Fj_dep);

    // pertes generation
    const Bch_hp_j = bvj * dh19j;
    const Bch_hp_j_dep = bvj_dep * dh21j;

    gen_ch_recup.forEach((gen_ch) => {
      pertes_generateur_ch_recup += calc_Qrec_gen_j(gen_ch, nref19, Bch_hp_j) / 1000;
      pertes_generateur_ch_recup_depensier += calc_Qrec_gen_j(gen_ch, nref21, Bch_hp_j_dep) / 1000;
    });

    besoin_ch += (bvj * dh19j) / 1000;
    besoin_ch_depensier += (bvj_dep * dh21j) / 1000;
  }

  pertes_distribution_ecs_recup = (0.48 * sumNref19 * QrecDistr) / 8760;
  pertes_distribution_ecs_recup_depensier = (0.48 * sumNref21 * QrecDistrDepensier) / 8760;

  const recup =
    pertes_distribution_ecs_recup + pertes_stockage_ecs_recup + pertes_generateur_ch_recup;
  const recup_depensier =
    pertes_distribution_ecs_recup_depensier +
    pertes_stockage_ecs_recup_depensier +
    pertes_generateur_ch_recup_depensier;

  besoin_ch -= recup;
  besoin_ch_depensier -= recup_depensier;

  fraction_apport_gratuit_ch /= Njj_sum;
  fraction_apport_gratuit_depensier_ch /= Njj_sum;

  return {
    besoin_ch,
    besoin_ch_depensier,
    pertes_distribution_ecs_recup,
    pertes_distribution_ecs_recup_depensier,
    pertes_stockage_ecs_recup,
    /* pertes_stockage_ecs_recup_depensier: pertes_stockage_ecs_recup_depensier, */
    pertes_generateur_ch_recup,
    pertes_generateur_ch_recup_depensier,
    fraction_apport_gratuit_ch,
    fraction_apport_gratuit_depensier_ch
  };
}

function calc_Fj(GV, asj, aij, dhj, inertie) {
  if (dhj == 0) return 0;

  let pow;
  if (inertie === 'très lourde' || inertie === 'lourde') pow = 3.6;
  else if (inertie === 'moyenne') pow = 2.9;
  else if (inertie === 'légère') pow = 2.5;

  const Xj = (asj + aij) / (GV * dhj);
  const Fj = (Xj - Xj ** pow) / (1 - Xj ** pow);
  /* console.warn(Fj) */
  return Fj;
}

function calc_bvj(GV, Fj) {
  const bvj = GV * (1 - Fj);
  return bvj;
}
