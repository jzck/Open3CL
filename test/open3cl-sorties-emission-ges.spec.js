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
    'emission_ges_ch',
    'emission_ges_ch_depensier',
    'emission_ges_ecs',
    'emission_ges_ecs_depensier',
    'emission_ges_eclairage',
    'emission_ges_auxiliaire_generation_ch',
    'emission_ges_auxiliaire_generation_ch_depensier',
    'emission_ges_auxiliaire_distribution_ch',
    'emission_ges_auxiliaire_generation_ecs',
    'emission_ges_auxiliaire_generation_ecs_depensier',
    'emission_ges_auxiliaire_distribution_ecs',
    'emission_ges_auxiliaire_distribution_fr',
    'emission_ges_auxiliaire_ventilation',
    'emission_ges_totale_auxiliaire',
    'emission_ges_fr',
    'emission_ges_fr_depensier',
    'emission_ges_5_usages',
    'emission_ges_5_usages_m2',
    'classe_emission_ges'
  ])('check "emission_ges.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.emission_ges[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.emission_ges[attr]
      );
    });
  });
});
