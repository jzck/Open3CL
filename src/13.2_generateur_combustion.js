import { bug_for_bug_compat, convertExpression, tv, tvColumnLines } from './utils.js';
import enums from './enums.js';
import { updateGenerateurBouilleurs } from './13.2_generateur_combustion_bouilleur.js';
import { updateGenerateurChaudieres } from './13.2_generateur_combustion_chaudiere.js';
import { updateGenerateurPacs } from './13.2_generateur_pac.js';
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
      if (eval(`let Pn=${Pn} ;${convertExpression(critere)}`)) {
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

/**
 * Si la méthode de saisie n'est pas "Valeur forfaitaire" mais "caractéristiques saisies"
 * Documentation 3CL : "Pour les installations récentes ou recommandées, les caractéristiques réelles des chaudières présentées sur les bases
 * de données professionnelles peuvent être utilisées."
 *
 * 2 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système à combustion : pn, autres données forfaitaires
 * 3 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système à combustion : pn, rpn,rpint, autres données forfaitaires
 * 4 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système à combustion : pn, rpn,rpint,qp0, autres données forfaitaires
 * 5 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système à combustion : pn, rpn,rpint,qp0,temp_fonc_30,temp_fonc_100
 *
 * @param dpe {FullDpe}
 * @param di {Donnee_intermediaire} données du générateur
 * @param de {Donnee_entree} données du générateur
 * @param type {'ecs'|'ch'}
 * @param GV {number} déperdition de l'enveloppe
 * @param tbase {number} température de fonctionnement du générateur
 * @param methodeSaisie {number} méthode de saisie des caractéristiques du générateur
 */
export function tv_generateur_combustion(dpe, di, de, type, GV, tbase, methodeSaisie) {
  const typeGenerateurKey = `enum_type_generateur_${type}_id`;
  let enumTypeGenerateurId = de[typeGenerateurKey];
  let row;

  /**
   * Certains DPE configurent mal les données du générateur ECS lorsque c'est un générateur mixte Chauffage + ECS
   * Confrontation du type de générateur ECS et CH et prise en compte des données du générateur de chauffage
   *
   * enum_usage_generateur_id = 3 - 'chauffage + ecs'
   */
  if (bug_for_bug_compat && type === 'ecs' && de.enum_usage_generateur_id === '3') {
    enumTypeGenerateurId = checkEcsVsChauffageForMixteGeneration(dpe, de, typeGenerateurKey);
  }

  /**
   * Si le type de générateur est
   * 84 - ECS - système collectif par défaut en abscence d'information : chaudière fioul pénalisante
   * 119 - CH - système collectif par défaut en abscence d'information : chaudière fioul pénalisante
   * On garde l'information à partir de tv_generateur_combustion_id.
   */
  if (
    bug_for_bug_compat &&
    ((type === 'ecs' && enumTypeGenerateurId === '84') ||
      (type === 'ch' && enumTypeGenerateurId === '119')) &&
    de.tv_generateur_combustion_id
  ) {
    row = tv('generateur_combustion', {
      tv_generateur_combustion_id: de.tv_generateur_combustion_id
    });
    console.warn(`
      Le générateur ${de.description} est caractérisé 'système collectif par défaut'. 
      Utilisation de tv_generateur_combustion_id pour récupération des informations techniques du générateur.
    `);
  } else {
    // Calcul de la puissance nominale si non définie
    if (!di.pn) {
      di.pn = (1.2 * GV * (19 - tbase)) / 0.95 ** 3;
    }

    let matcher = {};
    matcher[typeGenerateurKey] = enumTypeGenerateurId;
    matcher.critere_pn = criterePn(di.pn / (de.ratio_virtualisation * 1000), matcher);

    row = tv('generateur_combustion', matcher);

    /**
     * Si l'identifiant du générateur à combustion utilisé n'est pas le bon, avertissement
     */
    if (
      bug_for_bug_compat &&
      type === 'ecs' &&
      row.tv_generateur_combustion_id !== de.tv_generateur_combustion_id
    ) {
      const rowDpe = tv('generateur_combustion', {
        tv_generateur_combustion_id: de.tv_generateur_combustion_id
      });

      // Si tv_generateur_combustion_id utilisé n'est pas
      if (
        rowDpe &&
        (!rowDpe.enum_type_generateur_ecs_id ||
          !rowDpe.enum_type_generateur_ecs_id.split('|').includes(de.enum_type_generateur_ecs_id))
      ) {
        console.error(`
          Le DPE utilise les caractéristiques liées à tv_generateur_combustion_id = '${de.tv_generateur_combustion_id}' qui ne correspond pas au 
          générateur ECS enum_type_generateur_ecs_id = '${de.enum_type_generateur_ecs_id}'. Les données utilisées par le DPE et les résultats
          qui en découlent sont probablement erronés.
        `);
      }
    }
  }

  if (!row) {
    console.error(
      'Pas de valeur forfaitaire trouvée pour le générateur à combustion ${de.description}'
    );
    return;
  }

  de.tv_generateur_combustion_id = Number(row.tv_generateur_combustion_id);

  const E = E_tab[de.presence_ventouse];
  const F = F_tab[de.presence_ventouse];

  /**
   * Si la consommation ECS est obtenue par virtualisation du générateur collectif pour les besoins individuels
   * la puissance nominale est obtenu à partir de la puissance nominale du générateur collectif multiplié par le
   * ratio de virtualisation
   * 17.2.1 - Génération d’un DPE à l’appartement / Traitement des usages collectifs
   */
  if (![3, 4, 5].includes(methodeSaisie)) {
    if (row.rpn) {
      di.rpn = excel_to_js_exec(row.rpn, di.pn / (de.ratio_virtualisation || 1), E, F) / 100;
    }
    if (type === 'ch' && row.rpint) {
      di.rpint = excel_to_js_exec(row.rpint, di.pn / (de.ratio_virtualisation || 1), E, F) / 100;
    }
  }

  if (![4, 5].includes(methodeSaisie)) {
    if (row.qp0_perc) {
      const qp0_calc = excel_to_js_exec(row.qp0_perc, di.pn / (de.ratio_virtualisation || 1), E, F);
      // Certaines chaudières ont un qp0 en % de pn, d'autres ont des valeurs constantes
      di.qp0 = row.qp0_perc.includes('Pn')
        ? qp0_calc * 1000 * (de.ratio_virtualisation || 1)
        : row.qp0_perc.includes('%')
          ? qp0_calc * di.pn
          : qp0_calc * 1000;
    } else {
      di.qp0 = 0;
    }
  }

  if (methodeSaisie === 1 || !di.pveilleuse) {
    di.pveil = Number(row.pveil) || 0;
  } else {
    di.pveil = di.pveilleuse || 0;
  }
}

/**
 * Mise à jour du type de générateur si besoin
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
export function updateGenerateurCombustion(dpe, de, type) {
  updateGenerateurBouilleurs(dpe, de, type);
  updateGenerateurChaudieres(dpe, de, type);
  updateGenerateurPacs(dpe, de, type);
  addInfosFromFichesTechniques(dpe, de);
}

/**
 * Récupération d'informations complémentaires issues des fiches techniques pour les générateurs
 *
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 */
function addInfosFromFichesTechniques(dpe, de) {
  // Récupération de la présence ou non d'un système de ventilation
  const ficheTechnique = getFicheTechnique(
    dpe,
    '8',
    'Présence ventilateur / dispositif circulation air dans circuit combustion',
    [de.description]
  )?.valeur;

  if (ficheTechnique && ficheTechnique === 'oui') {
    de.presenceVentilateur = 1;
  }
}

/**
 * Vérifier que les informations du générateur ECS sont bien les mêmes que celles du générateur de chauffage
 * Dans le cas d'une génération mixte, le type du générateur doit être le même
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 * @param typeGenerateurKey {string}
 * @returns {string}
 */
function checkEcsVsChauffageForMixteGeneration(dpe, de, typeGenerateurKey) {
  const ecsGenerateurId = de[typeGenerateurKey];

  /**
   * Si le générateur ECS est un générateur par défaut, pas d'information assez précise pour redresser la donnée
   *
   * 78 - autre système à combustion gaz
   * 79 - autre système à combustion fioul
   * 80 - autre système à combustion bois
   * 81 - autre système à combustion autres energies fossiles (charbon,pétrole etc…)
   * 82 - autre système thermodynamique électrique
   * 83 - autre système thermodynamique gaz
   */
  if (['78', '79', '80', '81', '82', '83'].includes(de[`previous_${typeGenerateurKey}`])) {
    return ecsGenerateurId;
  }

  /**
   * @type {InstallationChauffageItem[]}
   */
  const installationsCh = dpe.logement.installation_chauffage_collection.installation_chauffage;

  // Récupération des générateurs de chauffage ayant pour usage ECS + Chauffage également
  const generateursChMixtes = installationsCh.reduce((acc, ch) => {
    return acc.concat(
      ch.generateur_chauffage_collection.generateur_chauffage.filter(
        (value) => value.donnee_entree.enum_usage_generateur_id === '3'
      )
    );
  }, []);

  if (generateursChMixtes.length) {
    const firstChGenerateurMixte = generateursChMixtes[0];
    const firstChGenerateurMixteId =
      firstChGenerateurMixte.donnee_entree.enum_type_generateur_ch_id;
    const typeGenerateurEcs = enums.type_generateur_ecs;
    const typeGenerateurCh = enums.type_generateur_ch;

    const ecsGenerateurType = typeGenerateurEcs[ecsGenerateurId];
    const chGenerateurType = typeGenerateurCh[firstChGenerateurMixteId];

    // Si les 2 générateurs n'ont pas le même type
    if (ecsGenerateurType !== chGenerateurType) {
      // Recherche de l'identifiant du générateur ECS identique au générateur de chauffage
      const newEcsGenerateurId = Object.keys(typeGenerateurEcs).find(
        (key) => typeGenerateurEcs[key] === typeGenerateurCh[firstChGenerateurMixteId]
      );

      if (newEcsGenerateurId) {
        console.error(`
          Le générateur mixte ECS + CH identifié pour la génération ECS '${ecsGenerateurType}' n'est pas le même que celui identifié pour le générateur de chauffage '${chGenerateurType}'.
          On conserve le type de générateur de chauffage '${chGenerateurType}' pour la suite des calculs ECS.
        `);

        return newEcsGenerateurId;
      }
    }
  }

  return ecsGenerateurId;
}
