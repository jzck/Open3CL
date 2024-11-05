import { bug_for_bug_compat, tv, tvColumnLines } from './utils.js';

function criterePn(Pn, matcher) {
  let critere_list = tvColumnLines('generateur_combustion', 'critere_pn', matcher);
  critere_list = critere_list.filter((critere) => critere);
  let ret;
  if (critere_list.length === 0) {
    ret = null;
  } else {
    // change ≤ to <= in all critere_list
    critere_list = critere_list.map((c) => c.replace('≤', '<='));
    // find critere in critere_list that is true when executed
    for (const critere of critere_list) {
      if (eval(`let Pn=${Pn} ;${critere}`)) {
        ret = critere.replace('<=', '≤');
        break;
      }
    }
    if (!ret) console.warn('!! pas de critere trouvé pour pn !!');
  }
  return ret;
}

const E_tab = {
  0: 2.5,
  1: 1.75
};

const F_tab = {
  0: -0.8,
  1: -0.55
};

function excel_to_js_exec(box, pn, E, F) {
  const formula = box
    .replace(/ /g, '')
    .replace(/,/g, '.')
    .replace(/\*logPn/g, '*Math.log10(Pn)')
    .replace(/\+logPn/g, '+Math.log10(Pn)')
    .replace(/logPn/g, '*Math.log10(Pn)')
    .replace(/%/g, '/100')
    .replace(/\^/g, '**');
  const js = `let Pn=${pn / 1000}, E=${E}, F=${F}; (${formula})`;
  /* console.warn(js) */
  const result = eval(js);
  /* console.warn(result) */
  return result;
}

export function tv_generateur_combustion(di, de, du, type, GV, tbase) {
  let matcher = {};
  const typeGenerateur = `enum_type_generateur_${type}_id`;
  const enum_type_generateur_id = de[typeGenerateur];

  let row;

  if (de.tv_generateur_combustion_id) {
    matcher[`tv_generateur_combustion_id`] = de.tv_generateur_combustion_id;
    row = tv('generateur_combustion', matcher);

    if (bug_for_bug_compat) {
      if (
        !row[typeGenerateur] ||
        !row[typeGenerateur].split('|').includes(enum_type_generateur_id)
      ) {
        row = null;
        matcher = {};
        console.warn(
          `Correction tv_generateur_combustion_id pour le générateur ECS. La valeur tv_generateur_combustion_id saisie ne correspond pas au générateur décrit`
        );
      }
    }
  }

  if (!row) {
    matcher[typeGenerateur] = enum_type_generateur_id;

    if (!di.pn) {
      // some engines don't set ms_carac_sys properly...
      // so instead we just check if di.pn is set or not
      di.pn = (1.2 * GV * (19 - tbase)) / 0.95 ** 3;
    }

    matcher.critere_pn = criterePn(di.pn / 1000, matcher);
    row = tv('generateur_combustion', matcher);
  }

  if (!row) console.error('!! pas de valeur forfaitaire trouvée pour generateur_combustion !!');
  de.tv_generateur_combustion_id = Number(row.tv_generateur_combustion_id);
  if (Number(row.pn)) di.pn = Number(row.pn) * 1000;
  const E = E_tab[de.presence_ventouse];
  const F = F_tab[de.presence_ventouse];

  /**
   * Si la consommation ECS est obtenue par virtualisation du générateur collectif pour les besoins individuels
   * la puissance nominale est obtenu à partir de la puissance nominale du générateur collectif multiplié par le
   * ratio de virtualisation
   * 17.2.1 - Génération d’un DPE à l’appartement / Traitement des usages collectifs
   */
  if (row.rpn)
    di.rpn = excel_to_js_exec(row.rpn, di.pn / (de.ratio_virtualisation || 1), E, F) / 100;
  if (type === 'ch' && row.rpint) di.rpint = excel_to_js_exec(row.rpint, di.pn, E, F) / 100;
  if (row.qp0_perc) {
    const qp0_calc = excel_to_js_exec(row.qp0_perc, di.pn, E, F);
    if (row.qp0_perc.includes('Pn')) di.qp0 = qp0_calc * 1000;
    else di.qp0 = qp0_calc * di.pn;
  } else di.qp0 = 0;
  if (Number(row.pveil)) di.pveil = Number(row.pveil);
  else di.pveil = 0;
}
