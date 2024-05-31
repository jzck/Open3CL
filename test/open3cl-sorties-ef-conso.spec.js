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
    'conso_ch',
    'conso_ch_depensier',
    'conso_ecs',
    'conso_ecs_depensier',
    'conso_eclairage',
    'conso_auxiliaire_generation_ch',
    'conso_auxiliaire_generation_ch_depensier',
    'conso_auxiliaire_distribution_ch',
    'conso_auxiliaire_generation_ecs',
    'conso_auxiliaire_generation_ecs_depensier',
    'conso_auxiliaire_distribution_ecs',
    'conso_auxiliaire_distribution_fr',
    'conso_auxiliaire_ventilation',
    'conso_totale_auxiliaire',
    'conso_fr',
    'conso_fr_depensier',
    'conso_5_usages',
    'conso_5_usages_m2'
  ])('check "ef_conso.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.ef_conso[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.ef_conso[attr]
      );
    });
  });
});
