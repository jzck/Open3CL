import enums from './enums.js'
import { tv } from './utils.js'
import { requestInput, requestInputID } from './utils.js'

function findRanges(inputNumber) {
  const ranges = [0.25, 0.5, 0.75, 1, 1.25, 2, 2.5, 3, 3.5, 4, 6, 8, 10, 25, 50]
  const result = []

  if (inputNumber < ranges[0]) {
    result.push(null)
    result.push(ranges[0])
  } else if (inputNumber > ranges[ranges.length - 1]) {
    result.push(ranges[ranges.length - 1])
    result.push(null)
  } else {
    for (let i = 0; i < ranges.length; i++) {
      if (inputNumber <= ranges[i]) {
        if (i > 0) {
          result.push(ranges[i - 1])
        }
        result.push(ranges[i])
        break
      }
    }
  }
  return result
}

export default function b(di, de, du, zc_id) {
  let zc = enums.zone_climatique[zc_id].slice(0, 2)

  du.enum_type_adjacence_id = Object.keys(enums.type_adjacence)
  let matcher = {
    enum_type_adjacence_id: requestInputID(de, du, 'type_adjacence')
  }

  if (de.enum_type_adjacence_id === '10') {
    matcher.zone_climatique = zc
    matcher.enum_cfg_isolation_lnc_id = requestInputID(de, du, 'cfg_isolation_lnc')
    /* du.enum_cfg_isolation_lnc_id = ['6', '7', '8', '9', '10', '11'] */
  } else if (
    ['8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '21'].includes(
      de.enum_type_adjacence_id
    )
  ) {
    matcher.enum_cfg_isolation_lnc_id = requestInputID(de, du, 'cfg_isolation_lnc')
    if (matcher.enum_cfg_isolation_lnc_id === '1') {
      delete matcher.enum_type_adjacence_id
    } else {
      requestInput(de, du, 'surface_aiu', 'float')
      requestInput(de, du, 'surface_aue', 'float')
      let ranges = findRanges(de.surface_aiu / de.surface_aue)
      if (ranges[0]) {
        matcher.aiu_aue_min =
          ranges[0]
            .toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false
            })
            .replace('.', ',') + ' <'
      }
      if (ranges[1]) {
        matcher.aiu_aue_max =
          '≤ ' +
          ranges[1]
            .toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false
            })
            .replace('.', ',')
      }
    }
  }

  let row = tv('coef_reduction_deperdition', matcher)
  if (row) {
    di.b = Number(row.b)
    de.tv_coef_reduction_deperdition_id = Number(row.tv_coef_reduction_deperdition_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour b !!')
  }
}
