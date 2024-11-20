import enums from './enums.js';
import { tv, requestInput, requestInputID, bug_for_bug_compat } from './utils.js';

function findRanges(inputNumber) {
  const ranges = [0.25, 0.5, 0.75, 1, 1.25, 2, 2.5, 3, 3.5, 4, 6, 8, 10, 25, 50];
  const result = [];

  if (inputNumber < ranges[0]) {
    result.push(null);
    result.push(ranges[0]);
  } else if (inputNumber > ranges[ranges.length - 1]) {
    result.push(ranges[ranges.length - 1]);
    result.push(null);
  } else {
    for (let i = 0; i < ranges.length; i++) {
      if (inputNumber <= ranges[i]) {
        if (i > 0) {
          result.push(ranges[i - 1]);
        }
        result.push(ranges[i]);
        break;
      }
    }
  }
  return result;
}

export default function b(di, de, du, zc_id) {
  const zc = enums.zone_climatique[zc_id].slice(0, 2);

  du.enum_type_adjacence_id = Object.keys(enums.type_adjacence);
  const matcher = {
    enum_type_adjacence_id: requestInputID(de, du, 'type_adjacence')
  };

  if (de.enum_type_adjacence_id === '10') {
    matcher.zone_climatique = zc;
    matcher.enum_cfg_isolation_lnc_id = requestInputID(de, du, 'cfg_isolation_lnc');
    /* du.enum_cfg_isolation_lnc_id = ['6', '7', '8', '9', '10', '11'] */
  } else if (
    ['8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '21'].includes(
      de.enum_type_adjacence_id.toString()
    )
  ) {
    if (de.surface_aue === 0) {
      // cf page 10
      // NOTE: bizarre de regarder aue pour un local chauffé non accessible
      // voir 2287E2336469P
      di.b = 0;
      return;
    }
    matcher.enum_cfg_isolation_lnc_id = requestInputID(de, du, 'cfg_isolation_lnc');
    if (matcher.enum_cfg_isolation_lnc_id === '1') {
      // local chauffé non accessible
      // aiu/aue non connu
      delete matcher.enum_type_adjacence_id;
    } else {
      requestInput(de, du, 'surface_aiu', 'float');
      requestInput(de, du, 'surface_aue', 'float');

      if (de.surface_aiu === de.surface_aue) {
        const defaultAiuAueMin = '0,75 <';
        const defaultAiuAueMax = '≤ 1,00';

        matcher.aiu_aue_min = defaultAiuAueMin;
        matcher.aiu_aue_max = defaultAiuAueMax;

        /**
         * Certains DPE utilisent seulement aiu_aue_max = '≤ 0,25' alors que le ratio surface_aiu / surface_aue est 1 et donc
         * on devrait avoir aiu_aue_min: '0,75 <' et aiu_aue_max: '≤ 1,00',
         */
        if (bug_for_bug_compat && de.tv_coef_reduction_deperdition_id) {
          const rowCoeffReductionpertes = tv('coef_reduction_deperdition', {
            tv_coef_reduction_deperdition_id: de.tv_coef_reduction_deperdition_id
          });

          if (rowCoeffReductionpertes) {
            matcher.aiu_aue_min = rowCoeffReductionpertes.aiu_aue_min || defaultAiuAueMin;
            matcher.aiu_aue_max = rowCoeffReductionpertes.aiu_aue_max || defaultAiuAueMax;

            if (
              matcher.aiu_aue_min !== defaultAiuAueMin ||
              matcher.aiu_aue_max !== defaultAiuAueMax
            ) {
              console.error(
                `Le calcul de b pour ${de.description} devrait se faire avec aiu_aue_min: '0,75 <' et aiu_aue_max: '≤ 1,00'
                car surface_aiu === surface_aue. aiu_aue_min = ${matcher.aiu_aue_min} et aiu_aue_max = ${matcher.aiu_aue_max}
                sont cependant utilisés par le DPE. Prise en compte de ces valeurs pour la suite des calculs`
              );
            }
          }
        }
      } else {
        const ranges = findRanges(de.surface_aiu / de.surface_aue);
        if (ranges[0]) {
          // Si le rapport des surfaces est égale à la borne inférieure, utilisation de la borne supérieure
          // et prise en compte de l'égalité
          if (ranges[0] === de.surface_aiu / de.surface_aue) {
            matcher.aiu_aue_max =
              '≤ ' +
              ranges[0]
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  useGrouping: false
                })
                .replace('.', ',');
          } else {
            matcher.aiu_aue_min =
              ranges[0]
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  useGrouping: false
                })
                .replace('.', ',') + ' <';
          }
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
              .replace('.', ',');
        }
      }
    }
  }

  const row = tv('coef_reduction_deperdition', matcher);
  if (row) {
    di.b = Number(row.b);
    de.tv_coef_reduction_deperdition_id = Number(row.tv_coef_reduction_deperdition_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour b !!');
  }
}
