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
    'deperdition_baie_vitree',
    'deperdition_enveloppe',
    'deperdition_mur',
    'deperdition_plancher_bas',
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
      expect(calculatedDpe.logement.sortie.deperdition[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.deperdition[attr]
      );
    });
  });
});
