import { tv, requestInput, requestInputID } from './utils.js'

export function tv_scop (di, de, du, zc_id, ed_id, type) {
  const matcher = {
    enum_zone_climatique_id: zc_id
  }
  matcher[`enum_generateur_${type}_id`] = requestInputID(de, du, `type_generateur_${type}`)
  if (ed_id) matcher.enum_type_emission_distribution_id = ed_id
  const row = tv('scop', matcher)
  if (row) {
    de.tv_scop_id = Number(row.tv_scop_id)
    const scop = row.scop_ou_cop
    di[scop] = Number(row.scop)

    // for Ich
    di.rg = di[scop]
    di.rg_dep = di[scop]
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour scop !!')
  }
}
