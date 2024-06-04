import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson, getResultFile, saveResultFile } from './test-helpers.js';
import { jest } from '@jest/globals';
import { PRECISION } from './constant.js';

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
    'production_pv',
    'conso_elec_ac',
    'conso_elec_ac_ch',
    'conso_elec_ac_ecs',
    'conso_elec_ac_fr',
    'conso_elec_ac_eclairage',
    'conso_elec_ac_auxiliaire',
    'conso_elec_ac_autre_usage'
  ])('check "production_electricite.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.production_electricite[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.production_electricite[attr],
        PRECISION
      );
    });
  });
});
