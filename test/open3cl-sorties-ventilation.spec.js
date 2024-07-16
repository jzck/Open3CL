import { getAdemeFileJson } from './test-helpers.js';
import { calcul_3cl } from '../src/index.js';

describe('calcul de déperdition par ventilation', () => {
  test('Les surfaces de déperdition ne doivent pas prendre en compte les surfaces déperditives (b > 0)', () => {
    const exceptedDpe = getAdemeFileJson('2213E0696993Z');

    const deperdition = calcul_3cl(exceptedDpe).logement.sortie.deperdition;
    expect(deperdition.hperm).toBe(5.21254089805847);
    expect(deperdition.hvent).toBe(58.352976000000005);
  });
});
