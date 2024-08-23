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
    'ep_conso_ch',
    'ep_conso_ch_depensier',
    'ep_conso_ecs',
    'ep_conso_ecs_depensier',
    'ep_conso_eclairage',
    'ep_conso_auxiliaire_generation_ch',
    'ep_conso_auxiliaire_generation_ch_depensier',
    'ep_conso_auxiliaire_distribution_ch',
    'ep_conso_auxiliaire_generation_ecs',
    'ep_conso_auxiliaire_generation_ecs_depensier',
    'ep_conso_auxiliaire_distribution_ecs',
    'ep_conso_auxiliaire_distribution_fr',
    'ep_conso_auxiliaire_ventilation',
    'ep_conso_totale_auxiliaire',
    'ep_conso_fr',
    'ep_conso_fr_depensier',
    'ep_conso_5_usages',
    'ep_conso_5_usages_m2'
  ])('check "ep_conso.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.ep_conso[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.ep_conso[attr],
        PRECISION
      );
    });
  });

  test.each(corpus)('check "ep_conso.classe_bilan_dpe" value', (ademeId) => {
    const exceptedDpe = getAdemeFileJson(ademeId);
    const calculatedDpe = getResultFile(ademeId);
    expect(calculatedDpe.logement.sortie.ep_conso['classe_bilan_dpe']).toBe(
      exceptedDpe.logement.sortie.ep_conso['classe_bilan_dpe']
    );
  });

  test.each(['2375E2453987C', '2375E2236932V'])(
    '"classe_bilan_dpe" should be updated with new values if surface < 40m2',
    (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);

      // classe_emission_ges should now be E instead of G with new values for surface <= 40m2
      expect(calculatedDpe.logement.sortie.ep_conso['classe_bilan_dpe']).toBe('E');
      expect(exceptedDpe.logement.sortie.ep_conso['classe_bilan_dpe']).toBe('G');
    }
  );
});
