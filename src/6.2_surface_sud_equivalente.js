import enums from './enums.js'
import tvs from './tv.js'
import { mois_liste } from './utils.js'

export function calc_sse_j(bv_list, zc, mois) {
  const c1 = tvs['c1']

  let ssej = bv_list.reduce((acc, bv) => {
    let type_adjacence = enums.type_adjacence[bv.donnee_entree.enum_type_adjacence_id]
    if (type_adjacence != 'extérieur') return acc
    let de = bv.donnee_entree
    let di = bv.donnee_intermediaire

    let orientation = enums.orientation[de.enum_orientation_id]
    let inclinaison = enums.inclinaison_vitrage[de.enum_inclinaison_vitrage_id]
    let oi = `${orientation} ${inclinaison}`
    if (inclinaison == 'horizontal') oi = 'horizontal'
    let c1j = c1[zc][mois][oi]

    let fe1 = di.fe1
    let fe2 = di.fe2
    let ssei = acc + (de.surface_totale_baie * c1j * di.sw * fe1 * fe2)
    return ssei
  }, 0)
  return ssej
}

export function calc_sse(zc, bv_list) {
  let sse = mois_liste.reduce((acc, mois) => acc + calc_sse_j(bv_list, zc, mois), 0)
  return sse
}
