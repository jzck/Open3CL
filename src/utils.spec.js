import { convertExpression, getRange, getThicknessFromDescription } from './utils.js';

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

  it.each([
    ['70 < Pn <= 400', '(70 < Pn) && (Pn <= 400)'],
    ['70 < Pn', '70 < Pn'],
    ['Pn <= 400', 'Pn <= 400'],
    ['Pn == 400', 'Pn == 400'],
    ['Pn', 'Pn'],
    [null, null],
    [undefined, undefined]
  ])('should transform expression %s to %s', (expression, expected) => {
    expect(convertExpression(expression)).toBe(expected);
  });

  it.each([
    [[1, 1.2, 3.4, 5.6], 0.5, [1, 1.2]],
    [[1, 1.2, 3.4, 5.6], 1, [1, 1]],
    [[1, 1.2, 3.4, 5.6], 1.3, [1.2, 3.4]],
    [[1, 1.2, 3.4, 5.6], 6.5, [3.4, 5.6]]
  ])('should for values %s and inputNumber %s return range %s', (ranges, inputNumber, expected) => {
    expect(getRange(inputNumber, ranges)).toStrictEqual(expected);
  });
});
