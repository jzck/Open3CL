import { getThicknessFromDescription } from './utils.js';

describe('Utils unit tests', () => {
  it.each([
    [0, null],
    [0, undefined],
    [0, ''],
    [0, 'Mur en blocs de béton creux'],
    [0, "Mur en blocs de béton creux d'épaisseur xxx cm non isolé"],
    [4, "Mur en blocs de béton creux d'épaisseur 4 cm non isolé"],
    [25, "Mur en blocs de béton creux d'&apos;'épaisseur ≥ 25 cm non isolé"]
  ])('should get thickness %s from description %s', (thickness, description) => {
    expect(getThicknessFromDescription(description)).toBe(thickness);
  });
});
