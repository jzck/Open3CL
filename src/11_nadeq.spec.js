import { Nadeq } from './11_nadeq.js';

describe('Nadeq unit tests', () => {
  /**
   * @see : Methode_de_calcul_3CL_DPE_2021-338.pdf Page 70
   */
  const nadeq = new Nadeq();

  it.each([
    [1, 8],
    [1, 28],
    [1.28125, 45],
    [1.39375, 51],
    [1.75, 70],
    [1.7875, 75]
  ])(
    'should get individual nadeq %s for surface_habitable_logement %s',
    (expectedNadeq, surface_habitable_logement) => {
      const logement = {
        caracteristique_generale: {
          enum_methode_application_dpe_log_id: 1,
          surface_habitable_logement
        }
      };
      expect(nadeq.calculateNadeq(logement)).toBe(expectedNadeq);
    }
  );

  it.each([
    [1, 8, 1],
    [2, 8, 2],
    [1.3375, 28, 1],
    [2.15, 28, 2],
    [1.65625, 45, 1],
    [2.46875, 45, 2],
    [1.7605, 51, 1],
    [2.58125, 51, 2],
    [1.96, 70, 1],
    [2.9375, 70, 2],
    [2.0125, 75, 1],
    [3.03125, 75, 2]
  ])(
    'should get collective nadeq %s for surface_habitable_immeuble %s, nombre_appartement %s',
    (expectedNadeq, surface_habitable_immeuble, nombre_appartement) => {
      const logement = {
        caracteristique_generale: {
          enum_methode_application_dpe_log_id: 6,
          surface_habitable_immeuble,
          nombre_appartement
        }
      };
      expect(nadeq.calculateNadeq(logement)).toBeCloseTo(expectedNadeq, 2);
    }
  );
});
