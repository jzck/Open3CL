import tvs from './tv.js'
import { mois_liste } from './utils.js'
import { calc_sse_j } from './6.2_surface_sud_equivalente.js'

export function calc_ai_j(Sh, nadeq, nrefj) {
  let Aij = (((3.18 + 0.34) * Sh + 90 * (132 / 168) * nadeq) * nrefj) / 1000
  return Aij
}

export function calc_as_j(ssej, ej) {
  let Asj = ssej * ej
  return Asj
}

export function calc_ai(ilpa, ca, zc, Sh, nadeq) {
  const Nref19 = tvs['nref19'][ilpa]
  const Nref21 = tvs['nref21'][ilpa]
  const Nref26 = tvs['nref26']
  const Nref28 = tvs['nref28']

  let ret = {
    apport_interne_ch: 0,
    /* apport_interne_ch_depensier: 0, */
    apport_interne_fr: 0
    /* apport_interne_fr_depensier: 0 */
  }
  for (const mois of mois_liste) {
    let nref19 = Nref19[ca][mois][zc]
    let nref21 = Nref21[ca][mois][zc]
    let nref26 = Nref26[ca][mois][zc]
    let nref28 = Nref28[ca][mois][zc]
    ret.apport_interne_ch += calc_ai_j(Sh, nadeq, nref19)
    /* ret.apport_interne_ch_depensier += calc_ai_j(Sh, nadeq, nref21) */
    ret.apport_interne_fr += calc_ai_j(Sh, nadeq, nref28)
    /* ret.apport_interne_fr_depensier += calc_ai_j(Sh, nadeq, nref26) */
  }
  return ret
}

export function calc_as(ilpa, ca, zc, bv) {
  const e = tvs['e'][ilpa]
  const e_fr_26 = tvs['e_fr_26']
  const e_fr_28 = tvs['e_fr_28']

  let As = 0
  let ret = {
    apport_solaire_ch: 0,
    apport_solaire_fr: 0
    /* apport_solaire_fr_depensier: 0 */
  }
  for (const mois of mois_liste) {
    let ssej = calc_sse_j(bv, zc, mois)
    let ej = e[ca][mois][zc]
    let ej_fr_26 = e_fr_26[ca][mois][zc]
    let ej_fr_28 = e_fr_28[ca][mois][zc]

    ret.apport_solaire_ch += calc_as_j(ssej, ej)
    ret.apport_solaire_fr += calc_as_j(ssej, ej_fr_28)
    /* ret.apport_solaire_fr_depensier += calc_as_j(ssej, ej_fr_26) */
  }
  return ret
}
