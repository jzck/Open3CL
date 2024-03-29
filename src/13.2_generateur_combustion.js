import enums from './enums.js'
import { tv, tvColumnLines, requestInput, requestInputID } from './utils.js'

function criterePn(pn, matcher) {
  let critere_list = tvColumnLines('generateur_combustion', 'critere_pn', matcher)
  critere_list = critere_list.filter((critere) => critere)
  // put criere with < and ≤ at the end of list
  critere_list = critere_list.sort((a, b) => (a.includes('≤') ? 1 : 0) - (b.includes('≤') ? 1 : 0))
  /* console.warn(critere_list) */
  let ret
  if (critere_list.length === 0) {
    ret = null
  } else {
    // change ≤ to <= in all critere_list
    critere_list = critere_list.map((c) => c.replace('≤', '<='))
    // find critere in critere_list that is true when executed
    for (const critere of critere_list) {
      if (eval(`let Pn=${pn} ;${critere}`)) {
        ret = critere.replace('<=', '≤')
        /* console.warn('found critere', ret) */
        break
      }
    }
    if (!ret) console.warn('!! pas de critere trouvé pour pn !!')
  }
  return ret
}

let E_tab = {
  0: 2.5,
  1: 1.75
}

let F_tab = {
  0: -0.8,
  1: -0.55
}

function excel_to_js_exec(box, pn, E, F) {
  let formula = box
    .replace(/ /g, '')
    .replace(/,/g, '.')
    .replace(/\*logPn/g, '*Math.log10(Pn)')
    .replace(/\+logPn/g, '+Math.log10(Pn)')
    .replace(/logPn/g, '*Math.log10(Pn)')
    .replace(/%/g, '/100')
    .replace(/\^/g, '**')
  let js = `let Pn=${pn}, E=${E}, F=${F}; (${formula})`
  /* console.warn(js) */
  let result = eval(js)
  /* console.warn(result) */
  return result
}

export function tv_generateur_combustion(di, de, du, type, GV, tbase) {
  console.warn(`type: ${type}, GV: ${GV}, tbase: ${tbase}`)
  let matcher = {}
  let enum_type_generateur_id = de[`enum_type_generateur_${type}_id`]
  matcher[`enum_type_generateur_${type}_id`] = enum_type_generateur_id

  if (di.pn > 1000) {
    // ca c'est degueulasse:
    // parfois quand pn est saisi en W, et parfois en kW.
    di.pn = di.pn / 1000
  }
  let ms_carac_sys = requestInput(de, du, 'methode_saisie_carac_sys')
  if (!di.pn) {
    console.warn('recalcul pn', di.pn)
    // some engines don't set ms_carac_sys properly...
    // so instead we just check if di.pn is set or not
    di.pn = (1.2 * GV * (19 - tbase)) / 0.95 ** 3
  }
  matcher.critere_pn = criterePn(di.pn, matcher)
  console.warn(`critere_pn`, matcher.critere_pn)
  const row = tv('generateur_combustion', matcher, null)
  if (!row) console.error('!! pas de valeur forfaitaire trouvée pour generateur_combustion !!')
  de.tv_generateur_combustion_id = Number(row.tv_generateur_combustion_id)
  /* if (Number(row.pn)) di.pn = Number(row.pn) * 1000 */
  let E = E_tab[de.presence_ventouse]
  let F = F_tab[de.presence_ventouse]
  if (row.rpn) di.rpn = excel_to_js_exec(row.rpn, di.pn, E, F) / 100
  if (type === 'ch' && row.rpint) di.rpint = excel_to_js_exec(row.rpint, di.pn, E, F) / 100
  if (row.qp0_perc) {
    let qp0_calc = excel_to_js_exec(row.qp0_perc, di.pn, E, F)
    if (row.qp0_perc.includes('Pn')) di.qp0 = qp0_calc * 1000
    else di.qp0 = qp0_calc * di.pn * 1000
  } else di.qp0 = 0
  if (di.pveil) {
    // ce if ne marche que pour les DPEs existants, pour un nouveau DPE il faut absolument aller chercher
    // une valeur forfaitaire, et il faut un mecanisme pour que le diagnostiqueur puisse override
    if (Number(row.pveil)) di.pveil = Number(row.pveil)
    else di.pveil = 0
  } else {
    //Souvent, les diagnostiqueur saisissent pveil=0 car la chaudiere n'a pas de veilleuse
    //Dans ce cas, il ne faut pas aller chercher une valuer forfaitaire pour pveil
    di.pveil = 0
  }
}
