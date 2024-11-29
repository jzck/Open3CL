import getFicheTechnique from './ficheTechnique.js';

/**
 * Pour les générateurs "Autre système à combustion", les calculs sont faits comme pour les chaudières standard
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
export function updateGenerateurChaudieres(dpe, de, type) {
  /**
   * enum_type_generateur_ecs_id
   * 78 - autre système à combustion gaz
   * 79 - autre système à combustion fioul
   * 80 - autre système à combustion bois
   * 81 - autre système à combustion autres energies fossiles (charbon,pétrole etc…)
   */
  let ids;

  if (type === 'ecs') {
    // Ids des chaudières bois équivalentes pour les différentes périodes d'installation
    ids = {
      78: {
        1948: '45',
        1981: '46',
        1986: '47',
        1991: '48',
        2001: '49',
        2015: '50'
      },
      79: {
        1948: '35',
        1970: '36',
        1976: '37',
        1981: '38',
        1991: '39',
        2015: '40'
      },
      80: {
        1948: '15',
        1978: '16',
        1995: '17',
        2004: '18',
        2013: '19',
        2018: '20',
        2019: '21'
      },
      81: {
        1948: '35',
        1970: '36',
        1976: '37',
        1981: '38',
        1991: '39',
        2015: '40'
      }
    };
  } else {
    /**
     * enum_type_generateur_ch_id
     * 113 - autre système à combustion gaz
     * 114 - autre système à combustion fioul
     * 115 - autre système à combustion bois
     * 116 - autre système à combustion autres energies fossiles (charbon,pétrole etc…)
     */
    // Ids des chaudières bois équivalentes pour les différentes périodes d'installation
    ids = {
      113: {
        1948: '85',
        1981: '86',
        1986: '87',
        1991: '88',
        2001: '89',
        2015: '90'
      },
      114: {
        1948: '75',
        1970: '76',
        1976: '77',
        1981: '78',
        1991: '79',
        2015: '80'
      },
      115: {
        1948: '55',
        1978: '56',
        1995: '57',
        2004: '58',
        2013: '59',
        2018: '60',
        2019: '61'
      },
      116: {
        1948: '75',
        1970: '76',
        1976: '77',
        1981: '78',
        1991: '79',
        2015: '80'
      }
    };
  }

  updateGenerateurChaudiere(dpe, ids, de, type);
}

/**
 * Récupération du générateur équivalent à utiliser à la place du générateur décrit
 * La période du générateur équivalent est choisie par rapport à la date d'installation du générateur décrit
 * Ex:
 *  - Pour un système 'autre système à combustion fioul' granulés installé en 2000, on prendra la chaudière gaz standard 2001-2015
 * @param dpe {FullDpe}
 * @param ids
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
function updateGenerateurChaudiere(dpe, ids, de, type) {
  const enumType = `enum_type_generateur_${type}_id`;
  let generateurId = de[enumType];

  const steps = Object.keys(ids);

  if (steps.includes(generateurId)) {
    const values = ids[generateurId];
    de[`previous_${enumType}`] = generateurId;

    // Récupération de l'année d'installation du système ECS ou Chauffage dans les fiches techniques
    const ficheTechnique = getFicheTechnique(
      dpe,
      type === 'ch' ? '7' : '8',
      'année',
      'Autre système à combustion'
    )?.valeur;

    if (ficheTechnique) {
      if (ficheTechnique.toString().toLowerCase() === 'avant 1948') {
        generateurId = values[1948];
      } else {
        const installationDate = parseInt(ficheTechnique, 10);

        const entries = Object.entries(values)
          .map(([key, value]) => [key, value])
          .sort((a, b) => b[0] - a[0]);

        for (const [threshold, value] of entries) {
          if (installationDate >= threshold) {
            generateurId = value;
            break;
          }
        }
      }
    }

    de[enumType] = generateurId;
  }
}
