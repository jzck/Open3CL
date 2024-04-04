import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { jest } from '@jest/globals';
import { getAdemeFileJson, saveResultFile } from './test-helpers.js';

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

  describe('check each value for all ADEME files', () => {
    describe.each(corpus)('check "deperdition" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'deperdition_baie_vitree',
        'deperdition_enveloppe',
        'deperdition_mur',
        'deperdition_plancher_bas',
        'deperdition_plancher_haut',
        'deperdition_pont_thermique',
        'deperdition_porte',
        'deperdition_renouvellement_air',
        'hperm',
        'hvent'
      ])('check "deperdition.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.deperdition[attr]).toBe(
          dpeRequest.logement.sortie.deperdition[attr]
        );
      });
    });

    describe.each(corpus)('check "apport_et_besoin" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
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
        expect(dpeResult.logement.sortie.apport_et_besoin[attr]).toBe(
          dpeRequest.logement.sortie.apport_et_besoin[attr]
        );
      });
    });

    describe.each(corpus)('check "ef_conso" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'conso_ch',
        'conso_ch_depensier',
        'conso_ecs',
        'conso_ecs_depensier',
        'conso_eclairage',
        'conso_auxiliaire_generation_ch',
        'conso_auxiliaire_generation_ch_depensier',
        'conso_auxiliaire_distribution_ch',
        'conso_auxiliaire_generation_ecs',
        'conso_auxiliaire_generation_ecs_depensier',
        'conso_auxiliaire_distribution_ecs',
        'conso_auxiliaire_distribution_fr',
        'conso_auxiliaire_ventilation',
        'conso_totale_auxiliaire',
        'conso_fr',
        'conso_fr_depensier',
        'conso_5_usages',
        'conso_5_usages_m2'
      ])('check "ef_conso.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.ef_conso[attr]).toBe(
          dpeRequest.logement.sortie.ef_conso[attr]
        );
      });
    });

    describe.each(corpus)('check "ep_conso" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'ep_conso_ch',
        'ep_conso_ch_depensier',
        'ep_conso_ecs',
        'ep_conso_ecs_depensier',
        'ep_conso_eclairage',
        'ep_conso_auxiliaire_generation_ch',
        'ep_conso_auxiliaire_generation_ch_depensier',
        'ep_conso_auxiliaire_distribution_ch',
        'ep_conso_auxiliaire_generation_ecs',
        'ep_conso_auxiliaire_generation_ecs_depensier',
        'ep_conso_auxiliaire_distribution_ecs',
        'ep_conso_auxiliaire_distribution_fr',
        'ep_conso_auxiliaire_ventilation',
        'ep_conso_totale_auxiliaire',
        'ep_conso_fr',
        'ep_conso_fr_depensier',
        'ep_conso_5_usages',
        'ep_conso_5_usages_m2',
        'classe_bilan_dpe'
      ])('check "ep_conso.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.ep_conso[attr]).toBe(
          dpeRequest.logement.sortie.ep_conso[attr]
        );
      });
    });

    describe.each(corpus)('check "emission_ges" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'emission_ges_ch',
        'emission_ges_ch_depensier',
        'emission_ges_ecs',
        'emission_ges_ecs_depensier',
        'emission_ges_eclairage',
        'emission_ges_auxiliaire_generation_ch',
        'emission_ges_auxiliaire_generation_ch_depensier',
        'emission_ges_auxiliaire_distribution_ch',
        'emission_ges_auxiliaire_generation_ecs',
        'emission_ges_auxiliaire_generation_ecs_depensier',
        'emission_ges_auxiliaire_distribution_ecs',
        'emission_ges_auxiliaire_distribution_fr',
        'emission_ges_auxiliaire_ventilation',
        'emission_ges_totale_auxiliaire',
        'emission_ges_fr',
        'emission_ges_fr_depensier',
        'emission_ges_5_usages',
        'emission_ges_5_usages_m2',
        'classe_emission_ges'
      ])('check "emission_ges.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.emission_ges[attr]).toBe(
          dpeRequest.logement.sortie.emission_ges[attr]
        );
      });
    });

    describe.each(corpus)('check "cout" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'cout_ch',
        'cout_ch_depensier',
        'cout_ecs',
        'cout_ecs_depensier',
        'cout_eclairage',
        'cout_auxiliaire_generation_ch',
        'cout_auxiliaire_generation_ch_depensier',
        'cout_auxiliaire_distribution_ch',
        'cout_auxiliaire_generation_ecs',
        'cout_auxiliaire_generation_ecs_depensier',
        'cout_auxiliaire_distribution_ecs',
        'cout_auxiliaire_distribution_fr',
        'cout_auxiliaire_ventilation',
        'cout_total_auxiliaire',
        'cout_fr',
        'cout_fr_depensier',
        'cout_5_usages'
      ])('check "cout.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.cout[attr]).toBe(dpeRequest.logement.sortie.cout[attr]);
      });
    });

    describe.each(corpus)('check "production_electricite" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'production_pv',
        'conso_elec_ac',
        'conso_elec_ac_ch',
        'conso_elec_ac_ecs',
        'conso_elec_ac_fr',
        'conso_elec_ac_eclairage',
        'conso_elec_ac_auxiliaire',
        'conso_elec_ac_autre_usage'
      ])('check "production_electricite.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.production_electricite[attr]).toBe(
          dpeRequest.logement.sortie.production_electricite[attr]
        );
      });
    });

    describe.each(corpus)('check "sortie_par_energie_collection" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      // @todo: check correct test
      test.each([
        'sortie_par_energie',
        'conso_elec_ac',
        'conso_elec_ac_ch',
        'conso_elec_ac_ecs',
        'conso_elec_ac_fr',
        'conso_elec_ac_eclairage',
        'conso_elec_ac_auxiliaire',
        'conso_elec_ac_autre_usage'
      ])('check "sortie_par_energie_collection.%s" value', (attr) => {
        expect(
          dpeResult.logement.sortie.sortie_par_energie_collection.sortie_par_energie
        ).toHaveLength(
          dpeRequest.logement.sortie.sortie_par_energie_collection.sortie_par_energie.length
        );

        dpeRequest.logement.sortie.sortie_par_energie_collection.sortie_par_energie.forEach(
          (sortie_par_energie, idx) => {
            expect(sortie_par_energie[attr]).toBe(
              dpeRequest.logement.sortie.sortie_par_energie_collection.sortie_par_energie[idx][attr]
            );
          }
        );
      });
    });

    describe.each(corpus)('check "confort_ete" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'isolation_toiture',
        'protection_solaire_exterieure',
        'aspect_traversant',
        'brasseur_air',
        'inertie_lourde',
        'enum_indicateur_confort_ete_id'
      ])('check "confort_ete.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.confort_ete[attr]).toBe(
          dpeRequest.logement.sortie.confort_ete[attr]
        );
      });
    });

    describe.each(corpus)('check "qualite_isolation" values for file %s', (ademeId) => {
      let dpeRequest, dpeResult;

      beforeAll(() => {
        dpeRequest = getAdemeFileJson(ademeId);
        dpeResult = calcul_3cl(structuredClone(dpeRequest));
      });

      test.each([
        'ubat',
        'qualite_isol_enveloppe',
        'qualite_isol_mur',
        'qualite_isol_plancher_haut_toit_terrasse',
        'qualite_isol_plancher_haut_comble_perdu',
        'qualite_isol_plancher_haut_comble_amenage',
        'qualite_isol_plancher_bas',
        'qualite_isol_menuiserie'
      ])('check "qualite_isolation.%s" value', (attr) => {
        expect(dpeResult.logement.sortie.qualite_isolation[attr]).toBe(
          dpeRequest.logement.sortie.qualite_isolation[attr]
        );
      });
    });
  });
});
