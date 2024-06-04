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
    'cout_ch',
    'cout_ch_depensier',
    'cout_ecs',
    'cout_ecs_depensier',
    'cout_eclairage',
    'cout_auxiliaire_generation_ch',
    'cout_auxiliaire_generation_ch_depensier',
    'cout_auxiliaire_distribution_ch',
    'cout_auxiliaire_generation_ecs',
    'cout_auxiliaire_generation_ecs_depensier',
    'cout_auxiliaire_distribution_ecs',
    'cout_auxiliaire_distribution_fr',
    'cout_auxiliaire_ventilation',
    'cout_total_auxiliaire',
    'cout_fr',
    'cout_fr_depensier',
    'cout_5_usages'
  ])('check "cout.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.cout[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.cout[attr],
        PRECISION
      );
    });
  });
});
