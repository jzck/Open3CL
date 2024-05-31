import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson, getResultFile, saveResultFile } from './test-helpers.js';
import { jest } from '@jest/globals';

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
    'ubat',
    'qualite_isol_enveloppe',
    'qualite_isol_mur',
    'qualite_isol_plancher_haut_toit_terrasse',
    'qualite_isol_plancher_haut_comble_perdu',
    'qualite_isol_plancher_haut_comble_amenage',
    'qualite_isol_plancher_bas',
    'qualite_isol_menuiserie'
  ])('check "qualite_isolation.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.qualite_isolation[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.qualite_isolation[attr]
      );
    });
  });
});
