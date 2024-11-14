import { bug_for_bug_compat, tv, tvColumnLines } from './utils.js';
import getFicheTechnique from './ficheTechnique.js';

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
  matcher[typeGenerateur] = enum_type_generateur_id;

  if (!di.pn) {
    // some engines don't set ms_carac_sys properly...
    // so instead we just check if di.pn is set or not
    di.pn = (1.2 * GV * (19 - tbase)) / 0.95 ** 3;
  }

  matcher.critere_pn = criterePn(di.pn / 1000, matcher);
  let row = tv('generateur_combustion', matcher);

  /**
   * Si le type de générateur est
   * 84 - ECS - système collectif par défaut en abscence d'information : chaudière fioul pénalisante
   * 119 - CH - système collectif par défaut en abscence d'information : chaudière fioul pénalisante
   * On garde l'information à partir de tv_generateur_combustion_id.
   * Si non, on vérifie que le générateur décrit fait bien partie des générateurs associés pour tv_generateur_combustion_id spécifié
   */
  if (
    bug_for_bug_compat &&
    (
      (type === 'ecs' && enum_type_generateur_id === '84')
      || (type === 'ch' && enum_type_generateur_id === '119')
    ) &&
    de.tv_generateur_combustion_id
  ) {
    const tv_row = tv('generateur_combustion', {
      tv_generateur_combustion_id: de.tv_generateur_combustion_id
    });
    /* On vérifie que le tv_ est différent de celui trouvé par la table forfaitaire
     * et qu'il est compatible avec le générateur.
     */
    if (
      tv_row.tv_generateur_combustion_id !== row.tv_generateur_combustion_id &&
      (tv_row[typeGenerateur]?.split('|')?.includes(enum_type_generateur_id) ?? false)
    ) {
      console.warn('Bug compat. Utilisation du tv_generateur_combustion fourni');
      row = tv_row;
    }
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

/**
 * Mise à jour du type de générateur si besoin
 * Pour les générateurs "poêles à bois bouilleur", les calculs sont faits comme pour les chaudières bois
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
export function updateGenerateurCombustion(dpe, de, type) {
  /**
   * 13.1 Inserts et poêles
   * Les poêles à bois bouilleur sont traités comme des chaudières bois
   * L'année d'installation du générateur est récupéré, si définit, depuis les fiches techniques
   * Le générateur "chaudières bois" pour la même période est alors utilisé
   *
   * enum_type_generateur_ecs_id
   * 13 - poêle à bois bouilleur bûche installé avant 2012
   * 14 - poêle à bois bouilleur bûche installé à partir de 2012
   * 115 - poêle à bois bouilleur granulés installé avant 2012
   * 116 - poêle à bois bouilleur granulés installé à partir de 2012
   */
  if (type === 'ecs') {
    // Ids des chaudières bois équivalentes pour les différentes périodes d'installation
    const ids = {
      13: {
        1948: '15',
        1978: '16',
        1995: '17',
        2004: '18',
        2013: '19',
        2018: '20',
        2019: '21'
      },
      14: {
        1948: '15',
        1978: '16',
        1995: '17',
        2004: '18',
        2013: '19',
        2018: '20',
        2019: '21'
      },
      115: {
        1948: '29',
        1978: '30',
        1995: '31',
        2004: '32',
        2013: '33',
        2018: '33',
        2019: '34'
      },
      116: {
        1948: '29',
        1978: '30',
        1995: '31',
        2004: '32',
        2013: '33',
        2018: '33',
        2019: '34'
      }
    };

    updateGenerateur(dpe, ids, de, type);
  } else {
    /**
     * enum_type_generateur_ch_id
     * 48 - poêle à bois bouilleur bûche installé avant 2012
     * 49 - poêle à bois bouilleur bûche installé à partir de 2012
     * 140 - poêle à bois bouilleur granulés installé avant 2012
     * 141 - poêle à bois bouilleur granulés installé à partir de 2012
     */
    // Ids des chaudières bois équivalentes pour les différentes périodes d'installation
    const ids = {
      48: {
        1948: '55',
        1978: '56',
        1995: '57',
        2004: '58',
        2013: '59',
        2018: '60',
        2019: '61'
      },
      49: {
        1948: '55',
        1978: '56',
        1995: '57',
        2004: '58',
        2013: '59',
        2018: '60',
        2019: '61'
      },
      140: {
        1948: '69',
        1978: '70',
        1995: '71',
        2004: '72',
        2013: '73',
        2018: '73',
        2019: '74'
      },
      141: {
        1948: '69',
        1978: '70',
        1995: '71',
        2004: '72',
        2013: '73',
        2018: '73',
        2019: '74'
      }
    };

    updateGenerateur(dpe, ids, de, type);
  }
}

/**
 * Récupération du générateur équivalent à utiliser à la place du générateur décrit
 * La période du générateur équivalent est choisie par rapport à la date d'installation du générateur décrit
 * Ex:
 *  - Pour un poêle à bois bouilleur granulés installé en 2000, on prendra la chaudière bois granulés 1995-2003
 *  - Pour un poêle à bois bouilleur bûche installé avant 1948, on prendra la chaudière bois bûche avant 1978
 * @param dpe {FullDpe}
 * @param ids
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
function updateGenerateur(dpe, ids, de, type) {
  const enumType = `enum_type_generateur_${type}_id`;
  const generateurId = de[enumType];

  const steps = Object.keys(ids);

  if (steps.includes(generateurId)) {
    const values = ids[generateurId];

    // Récupération de l'année d'installation de la chaudière dans les fiches techniques
    const ficheTechnique = getFicheTechnique(dpe, '7', 'année', 'bouilleur')?.valeur;

    /**
     * Par défaut:
     * - Les poêles à bois bouilleur installées à partir de 2012 sont traités comme des chaudières bois installées entre 2004 et
     * 2012.
     * - Les poêles à bois bouilleur installées avant 2012 sont traités comme des chaudières bois installées entre 1978 et 1994.
     */
    let newGenerateurId = generateurId === 13 ? values[1978] : values[2004];

    if (ficheTechnique) {
      if (ficheTechnique.toString().toLowerCase() === 'avant 1948') {
        newGenerateurId = values[1948];
      } else {
        const installationDate = parseInt(ficheTechnique, 10);

        if (installationDate >= 2019) {
          newGenerateurId = values[2019];
        } else if (installationDate >= 2018) {
          newGenerateurId = values[2018];
        } else if (installationDate >= 2013) {
          newGenerateurId = values[2013];
        } else if (installationDate >= 2004) {
          newGenerateurId = values[2004];
        } else if (installationDate >= 1995) {
          newGenerateurId = values[1995];
        } else if (installationDate >= 1978) {
          newGenerateurId = values[1978];
        } else if (installationDate >= 1948) {
          newGenerateurId = values[1948];
        }
      }
    }

    de[enumType] = newGenerateurId;
  }
}
