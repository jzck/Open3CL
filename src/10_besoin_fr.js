import { tvs } from './tv.js'
import { mois_liste } from './utils.js'
import { calc_ai_j, calc_as_j } from './6.1_apport_gratuit.js'
import { calc_sse_j } from './6.2_surface_sud_equivalente.js'

const Cin = {
  'très lourde': 260000,
  lourde: 260000,
  moyenne: 165000,
  légère: 110000
}

export function calc_besoin_fr_j(Sh, GV, inertie, aij_fr, asj_fr, nrefj, textmoy_clim_j, Tint) {
  if (nrefj == 0) return 0
  let Rbth = (1000 * (aij_fr + asj_fr)) / (GV * (textmoy_clim_j - Tint) * nrefj)

  if (Rbth < 1 / 2) return 0

  let t = (Cin[inertie] * Sh) / (3600 * GV)
  let a = 1 + t / 15
  let futj
  if (Rbth == 1) futj = a / (a + 1)
  else futj = (1 - Rbth ** -a) / (1 - Rbth ** (-a - 1))
  let bfr = aij_fr + asj_fr - ((futj * GV) / 1000) * (Tint - textmoy_clim_j) * nrefj
  return bfr
}

export default function calc_besoin_fr(ilpa, ca, zc, Sh, nadeq, GV, inertie, bv) {
  const Nref26 = tvs['nref26']
  const Nref28 = tvs['nref28']
  const e_fr_26 = tvs['e_fr_26']
  const e_fr_28 = tvs['e_fr_28']
  const textmoy_clim_26 = tvs['textmoy_clim_26']
  const textmoy_clim_28 = tvs['textmoy_clim_28']

  let ret = {
    besoin_fr: 0,
    besoin_fr_depensier: 0
  }
  for (const mois of mois_liste) {
    let nref26 = Nref26[ca][mois][zc]
    let nref28 = Nref28[ca][mois][zc]
    let ej_fr_26 = e_fr_26[ca][mois][zc]
    let ej_fr_28 = e_fr_28[ca][mois][zc]
    let textmoy_clim_j_26 = textmoy_clim_26[ca][mois][zc]
    let textmoy_clim_j_28 = textmoy_clim_28[ca][mois][zc]

    let aij_fr = calc_ai_j(Sh, nadeq, nref28)
    let aij_fr_dep = calc_ai_j(Sh, nadeq, nref26)
    let ssej = calc_sse_j(bv, zc, mois)
    let asj_fr = calc_as_j(ssej, ej_fr_28)
    let asj_fr_dep = calc_as_j(ssej, ej_fr_26)

    ret.besoin_fr += calc_besoin_fr_j(
      Sh,
      GV,
      inertie,
      aij_fr,
      asj_fr,
      nref28,
      textmoy_clim_j_28,
      28
    )
    ret.besoin_fr_depensier += calc_besoin_fr_j(
      Sh,
      GV,
      inertie,
      aij_fr_dep,
      asj_fr_dep,
      nref26,
      textmoy_clim_j_26,
      26
    )
  }
  return ret
}
