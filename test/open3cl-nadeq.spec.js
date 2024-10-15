import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson, saveResultFile } from './test-helpers.js';
import { jest } from '@jest/globals';
import { Nadeq } from '../src/11_nadeq.js';

describe('Test Open3CL engine compliance on corpus', () => {
  const nadeq = new Nadeq();

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

  test.each(corpus)('check nadeq for dpe %s', (ademeId) => {
    const exceptedDpe = getAdemeFileJson(ademeId);
    const calculatedNadeq = nadeq.calculateNadeq(exceptedDpe.logement);

    expect(calculatedNadeq).toBeCloseTo(exceptedDpe.logement.sortie.apport_et_besoin.nadeq, 2);
  });
});
