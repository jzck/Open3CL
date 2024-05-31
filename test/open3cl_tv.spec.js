import { calcul_3cl } from '../src/engine.js';
import { getAdemeFileJson } from './test-helpers.js';

describe('Open3cl table values unit tests', () => {
  it('should match ujn in tv with a two digits precision uw number', () => {
    /**
     * In this file, uw_saisi: 2.35. It does not match any value in tv.js file (only 2.3 or 2.4)
     * The uw_saisi number is rounder to 2.4 before calling tv.js file
     */
    const output = calcul_3cl(structuredClone(getAdemeFileJson('2302E4043473J')));

    expect(
      output.logement.enveloppe.baie_vitree_collection.baie_vitree[0].donnee_intermediaire
    ).toMatchObject({ ujn: 2 });
  });
});
