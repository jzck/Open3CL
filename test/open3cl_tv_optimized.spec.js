import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson } from './test-helpers.js';
import { set_tv_match_optimized_version, unset_tv_match_optimized_version } from '../src/utils.js';

describe('Test Open3CL tvMatch function refactoring on corpus', () => {
  it('Both old and optimized tvMatch functions should produce same results', () => {
    for (let codeDpe of corpus) {
      const dpeRequest = getAdemeFileJson(codeDpe);
      unset_tv_match_optimized_version();
      const resultsWithOldTvMatch = calcul_3cl(structuredClone(dpeRequest));
      set_tv_match_optimized_version();
      const resultsWithNewTvMatch = calcul_3cl(structuredClone(dpeRequest));
      try {
        expect(resultsWithOldTvMatch).toStrictEqual(resultsWithNewTvMatch);
      } catch (error) {
        throw new Error(`Dpe ${codeDpe} does not match`);
      }
    }
  });
});
