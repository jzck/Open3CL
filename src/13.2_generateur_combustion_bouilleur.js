import getFicheTechnique from './ficheTechnique.js';

/**
 * Pour les générateurs "poêles à bois bouilleur", les calculs sont faits comme pour les chaudières bois
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
export function updateGenerateurBouilleurs(dpe, de, type) {
  let ids;

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
    ids = {
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
  } else {
    /**
     * enum_type_generateur_ch_id
     * 48 - poêle à bois bouilleur bûche installé avant 2012
     * 49 - poêle à bois bouilleur bûche installé à partir de 2012
     * 140 - poêle à bois bouilleur granulés installé avant 2012
     * 141 - poêle à bois bouilleur granulés installé à partir de 2012
     */
    // Ids des chaudières bois équivalentes pour les différentes périodes d'installation
    ids = {
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
  }

  updateGenerateurBouilleur(dpe, ids, de, type);
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
function updateGenerateurBouilleur(dpe, ids, de, type) {
  const enumType = `enum_type_generateur_${type}_id`;
  const generateurId = de[enumType];

  const steps = Object.keys(ids);

  if (steps.includes(generateurId)) {
    const values = ids[generateurId];

    // Récupération de l'année d'installation du système ECS ou Chauffage dans les fiches techniques
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
