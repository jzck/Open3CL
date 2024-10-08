import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson, saveResultFile } from './test-helpers.js';
import { jest } from '@jest/globals';
import { Inertie } from '../src/7_inertie.js';

describe('Test Open3CL engine compliance on corpus', () => {
  const inertie = new Inertie();

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

  test.each(corpus)('check enum_classe_inertie_id for dpe %s', (ademeId) => {
    const exceptedDpe = getAdemeFileJson(ademeId);
    const calculatedInertie = inertie.calc_inertie(exceptedDpe.logement.enveloppe);

    expect(calculatedInertie.enum_classe_inertie_id).toBe(
      exceptedDpe.logement.enveloppe.inertie.enum_classe_inertie_id
    );
  });
});
