import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { jest } from '@jest/globals';
import { getAdemeFileJson } from './test-helpers.js';

describe('Test Open3CL engine on corpus', () => {
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe.each(corpus)(
    'engine output should be same than original ADEME file for %s',
    (ademeId) => {
      let dpeResult, dpeRequest;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        try {
          dpeResult = calcul_3cl(structuredClone(dpeRequest));
        } catch (err) {
          console.warn(`3CL Engine failed for file ${ademeId}`, err);
        }
      });

      test('check "deperdition" value', () => {
        expect(dpeResult.logement.sortie.deperdition).toStrictEqual(
          dpeRequest.logement.sortie.deperdition
        );
      });

      test('check "apport_et_besoin" value', () => {
        expect(dpeResult.logement.sortie.apport_et_besoin).toStrictEqual(
          dpeRequest.logement.sortie.apport_et_besoin
        );
      });

      test('check "ef_conso" value', () => {
        expect(dpeResult.logement.sortie.ef_conso).toStrictEqual(
          dpeRequest.logement.sortie.ef_conso
        );
      });

      test('check "ep_conso" value', () => {
        expect(dpeResult.logement.sortie.ep_conso).toStrictEqual(
          dpeRequest.logement.sortie.ep_conso
        );
      });

      test('check "emission_ges" value', () => {
        expect(dpeResult.logement.sortie.emission_ges).toStrictEqual(
          dpeRequest.logement.sortie.emission_ges
        );
      });

      test('check "cout" value', () => {
        expect(dpeResult.logement.sortie.cout).toStrictEqual(dpeRequest.logement.sortie.cout);
      });

      test('check "production_electricite" value', () => {
        expect(dpeResult.logement.sortie.production_electricite).toStrictEqual(
          dpeRequest.logement.sortie.production_electricite
        );
      });

      test('check "sortie_par_energie_collection" value', () => {
        expect(dpeResult.logement.sortie.sortie_par_energie_collection).toStrictEqual(
          dpeRequest.logement.sortie.sortie_par_energie_collection
        );
      });

      test('check "confort_ete" value', () => {
        expect(dpeResult.logement.sortie.confort_ete).toStrictEqual(
          dpeRequest.logement.sortie.confort_ete
        );
      });

      test('check "qualite_isolation" value', () => {
        expect(dpeResult.logement.sortie.qualite_isolation).toStrictEqual(
          dpeRequest.logement.sortie.qualite_isolation
        );
      });
    }
  );
});
