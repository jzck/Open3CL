import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson, getResultFile, saveResultFile } from './test-helpers.js';
import { jest } from '@jest/globals';
import { PRECISION_PERCENT } from './constant.js';
import calc_pont_thermique from '../src/3.4_pont_thermique.js';

describe('Test Open3CL engine compliance on corpus', () => {
  /**
   * Generate all required files
   */
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    corpus.forEach((ademeId) => {
      const dpeRequest = getAdemeFileJson(ademeId);
      try {
        const dpeResult = calcul_3cl(structuredClone(dpeRequest));
        saveResultFile(ademeId, dpeResult);
      } catch (err) {
        console.warn(`3CL Engine failed for file ${ademeId}`, err);
      }
    });
  });

  describe.each([
    'deperdition_baie_vitree',
    'deperdition_enveloppe',
    'deperdition_plancher_bas',
    'deperdition_mur',
    'deperdition_plancher_haut',
    'deperdition_pont_thermique',
    'deperdition_porte',
    'deperdition_renouvellement_air',
    'hperm',
    'hvent'
  ])('check "deperdition.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      const expectedValue = calculatedDpe.logement.sortie.deperdition[attr];
      const calculatedValue = exceptedDpe.logement.sortie.deperdition[attr];

      const diff = Math.abs(expectedValue - calculatedValue) / expectedValue;
      expect(diff).toBeLessThan(PRECISION_PERCENT);
    });
  });

  describe('check "deperdition_mur" value', () => {
    const deperditionKey = 'deperdition_mur';

    test.each(corpus)('deperdition_mur for dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.deperdition[deperditionKey]).toBeCloseTo(
        exceptedDpe.logement.sortie.deperdition[deperditionKey],
        1
      );
    });
  });
});

describe('calcul de déperdition pont thermique avec plancher bas sur terre plein', () => {
  test('Mur  1 Sud, Est, Ouest / Plancher', () => {
    const pt = {
      donnee_entree: {
        description: 'Mur  1 Sud, Est, Ouest / Plancher',
        reference: 'PT_10',
        reference_1: '2023_03_02_16_36_57_5814466004550183',
        reference_2: '2023_03_02_16_32_16_9560121001674471',
        enum_methode_saisie_pont_thermique_id: '1'
      }
    };
    const enveloppe = {
      mur_collection: {
        mur: [
          {
            donnee_entree: {
              description:
                "Mur  1 Sud, Est, Ouest (p1) - Mur en blocs de béton creux d'épaisseur ≥ 25 cm avec un doublage rapporté donnant sur l'extérieur",
              reference: '2023_03_02_16_32_16_9560121001674471',
              enum_type_adjacence_id: '1',
              enum_type_isolation_id: '1',
              enum_periode_isolation_id: '5'
            },
            donnee_utilisateur: {}
          }
        ]
      },
      plancher_bas_collection: {
        plancher_bas: [
          {
            donnee_entree: {
              description:
                'Plancher - Plancher lourd type entrevous terre-cuite, poutrelles béton donnant sur un terre-plein',
              reference: '2023_03_02_16_36_57_5814466004550183',
              enum_type_adjacence_id: '5',
              surface_paroi_opaque: 80.3,
              enum_type_plancher_bas_id: '11',
              enum_type_isolation_id: '1',
              enum_periode_isolation_id: '5'
            },
            donnee_intermediaire: {},
            donnee_utilisateur: {}
          }
        ]
      },
      plancher_haut_collection: {},
      baie_vitree_collection: {},
      porte_collection: {},
      ets_collection: '',
      pont_thermique_collection: {
        pont_thermique: [
          {
            donnee_entree: {
              description: 'Mur  1 Sud, Est, Ouest / Plancher',
              reference: 'PT_10',
              reference_1: '2023_03_02_16_36_57_5814466004550183',
              reference_2: '2023_03_02_16_32_16_9560121001674471'
            }
          }
        ]
      }
    };
    calc_pont_thermique(pt, '5', enveloppe);
    expect(pt.donnee_intermediaire.k).toBe(0.31);
  });
});

describe('calcul de déperdition pour les plancher haut', () => {
  test("Plancher haut avec période d'isolation connue", () => {
    const exceptedDpe = getAdemeFileJson('2287E1724516Y');

    const deperdition =
      calcul_3cl(exceptedDpe).logement.sortie.deperdition.deperdition_plancher_haut;
    expect(deperdition).toBe(112.32);
  });

  test("Les plancher haut avec adjacence 'locaux non chauffés non accessible' doivent utiliser le paramètre type_toiture = 'terrasse'", () => {
    const exceptedDpe = getAdemeFileJson('2287E2336469P');

    const deperdition =
      calcul_3cl(exceptedDpe).logement.sortie.deperdition.deperdition_plancher_haut;
    expect(deperdition).toBe(29.4375);
  });
});
