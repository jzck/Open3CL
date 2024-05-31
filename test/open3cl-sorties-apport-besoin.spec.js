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
    'surface_sud_equivalente',
    'apport_solaire_fr',
    'apport_interne_fr',
    'apport_solaire_ch',
    'apport_interne_ch',
    'fraction_apport_gratuit_ch',
    'fraction_apport_gratuit_depensier_ch',
    'pertes_distribution_ecs_recup',
    'pertes_distribution_ecs_recup_depensier',
    'pertes_stockage_ecs_recup',
    'pertes_generateur_ch_recup',
    'pertes_generateur_ch_recup_depensier',
    'nadeq',
    'v40_ecs_journalier',
    'v40_ecs_journalier_depensier',
    'besoin_ch',
    'besoin_ch_depensier',
    'besoin_ecs',
    'besoin_ecs_depensier',
    'besoin_fr',
    'besoin_fr_depensier'
  ])('check "apport_et_besoin.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.apport_et_besoin[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.apport_et_besoin[attr]
      );
    });
  });
});
