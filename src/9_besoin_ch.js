import enums from './enums.js'
import tvs from './tv.js'
import { calc_Qdw_j } from './14_generateur_ecs.js'
import { calc_besoin_ecs_j } from './11_besoin_ecs.js'
import { calc_Qrec_gen_j } from './9_generateur_ch.js'
import { calc_ai_j, calc_as_j } from './6.1_apport_gratuit.js'
import { calc_sse_j } from './6.2_surface_sud_equivalente.js'
import { mois_liste, Njj, Njj_sum } from './utils.js'

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
  let ca = enums.classe_altitude[ca_id]
  let zc = enums.zone_climatique[zc_id]
  let inertie = enums.classe_inertie[inertie_id]

  let besoin_ch = 0
  let besoin_ch_depensier = 0

  let gen_ch = instal_ch[0].generateur_chauffage_collection.generateur_chauffage[0]

  const dh21 = tvs['dh21'][ilpa]
  const dh19 = tvs['dh19'][ilpa]
  const Nref21 = tvs['nref21'][ilpa]
  const Nref19 = tvs['nref19'][ilpa]
  const e = tvs['e'][ilpa]

  let pertes_distribution_ecs_recup = 0
  let pertes_distribution_ecs_recup_depensier = 0
  let pertes_stockage_ecs_recup = 0
  let pertes_stockage_ecs_recup_depensier = 0
  let pertes_generateur_ch_recup = 0
  let pertes_generateur_ch_recup_depensier = 0
  let fraction_apport_gratuit_ch = 0
  let fraction_apport_gratuit_depensier_ch = 0

  for (const mois of mois_liste) {
    /* console.warn(mois) */

    let nref19 = Nref19[ca][mois][zc]
    let nref21 = Nref21[ca][mois][zc]

    // pertes stockage
    let Qgw_total = instal_ecs.reduce((acc, instal_ecs) => {
      let gen_ecs = instal_ecs.generateur_ecs_collection.generateur_ecs
      return gen_ecs.reduce((acc, gen_ecs) => {
        return acc + (gen_ecs.donnee_intermediaire.Qgw || 0)
      }, 0)
    }, 0)
    let Qrec_stock_19 = (0.48 * nref19 * Qgw_total) / (24 * 365)
    let Qrec_stock_21 = (0.48 * nref21 * Qgw_total) / (24 * 365)
    pertes_stockage_ecs_recup += Qrec_stock_19 / 1000
    pertes_stockage_ecs_recup_depensier += Qrec_stock_21 / 1000

    // pertes distribution
    let becs_j = calc_besoin_ecs_j(ilpa, ca, mois, zc, nadeq, false)
    let becs_j_dep = calc_besoin_ecs_j(ilpa, ca, mois, zc, nadeq, true)
    let Qrec_distr = instal_ecs.reduce((acc, ecs) => acc + calc_Qdw_j(ecs, becs_j), 0)
    let Qrec_distr_dep = instal_ecs.reduce((acc, ecs) => acc + calc_Qdw_j(ecs, becs_j_dep), 0)
    pertes_distribution_ecs_recup += (0.48 * nref19 * Qrec_distr) / Njj[mois]
    pertes_distribution_ecs_recup_depensier += (0.48 * nref21 * Qrec_distr_dep) / Njj[mois]
    /* pertes_distribution_ecs_recup += 0.48 * nref19 * Qrec_distr */
    /* pertes_distribution_ecs_recup_depensier += 0.48 * nref21 * Qrec_distr_dep */
    /* console.warn(pertes_distribution_ecs_recup) */

    // bvj
    let dh19j = dh19[ca][mois][zc]
    let dh21j = dh21[ca][mois][zc]
    let aij = calc_ai_j(Sh, nadeq, nref19)
    let aij_dep = calc_ai_j(Sh, nadeq, nref21)
    let ssej = calc_sse_j(bv, zc, mois)
    let ej = e[ca][mois][zc]
    let asj = calc_as_j(ssej, ej)
    let Fj = calc_Fj(GV, asj, aij, dh19j, inertie)
    let Fj_dep = calc_Fj(GV, asj, aij_dep, dh21j, inertie)
    fraction_apport_gratuit_ch += Fj * Njj[mois]
    fraction_apport_gratuit_depensier_ch += Fj_dep * Njj[mois]
    let bvj = dh19j === 0 ? 0 : calc_bvj(GV, Fj)
    let bvj_dep = dh21j === 0 ? 0 : calc_bvj(GV, Fj_dep)

    // pertes generation
    let Bch_hp_j = bvj * dh19j
    let Bch_hp_j_dep = bvj_dep * dh21j
    pertes_generateur_ch_recup += calc_Qrec_gen_j(gen_ch, nref19, Bch_hp_j) / (1000 * 1000)
    pertes_generateur_ch_recup_depensier +=
      calc_Qrec_gen_j(gen_ch, nref21, Bch_hp_j_dep) / (1000 * 1000)

    besoin_ch += (bvj * dh19j) / 1000
    besoin_ch_depensier += (bvj_dep * dh21j) / 1000
  }

  pertes_distribution_ecs_recup /= 24
  pertes_distribution_ecs_recup_depensier /= 24
  /* console.warn(pertes_distribution_ecs_recup) */
  let recup = pertes_distribution_ecs_recup + pertes_stockage_ecs_recup + pertes_generateur_ch_recup
  let recup_depensier =
    pertes_distribution_ecs_recup_depensier +
    pertes_stockage_ecs_recup_depensier +
    pertes_generateur_ch_recup_depensier

  besoin_ch -= recup
  besoin_ch_depensier -= recup_depensier

  fraction_apport_gratuit_ch /= Njj_sum
  fraction_apport_gratuit_depensier_ch /= Njj_sum

  return {
    besoin_ch: besoin_ch,
    besoin_ch_depensier: besoin_ch_depensier,
    pertes_distribution_ecs_recup: pertes_distribution_ecs_recup,
    pertes_distribution_ecs_recup_depensier: pertes_distribution_ecs_recup_depensier,
    pertes_stockage_ecs_recup: pertes_stockage_ecs_recup,
    /* pertes_stockage_ecs_recup_depensier: pertes_stockage_ecs_recup_depensier, */
    pertes_generateur_ch_recup: pertes_generateur_ch_recup,
    pertes_generateur_ch_recup_depensier: pertes_generateur_ch_recup_depensier,
    fraction_apport_gratuit_ch: fraction_apport_gratuit_ch,
    fraction_apport_gratuit_depensier_ch: fraction_apport_gratuit_depensier_ch
  }
}

function calc_Fj(GV, asj, aij, dhj, inertie) {
  if (dhj == 0) return 0

  let pow
  if (inertie == 'très lourde' || inertie == 'lourde') pow = 3.6
  else if (inertie == 'moyenne') pow = 2.9
  else if (inertie == 'légère') pow = 2.5

  let Xj = (1000 * (asj + aij)) / (GV * dhj)
  let Fj = (Xj - Xj ** pow) / (1 - Xj ** pow)
  /* console.warn(Fj) */
  return Fj
}

function calc_bvj(GV, Fj) {
  let bvj = GV * (1 - Fj)
  return bvj
}
