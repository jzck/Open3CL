import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { getAdemeFileJson, getResultFile, saveResultFile } from './test-helpers.js';
import { jest } from '@jest/globals';

describe('Test Open3CL engine compliance on corpus', () => {
  /**
   * Generate all required files
   */
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

  describe.each([
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
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.deperdition[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.deperdition[attr]
      );
    });
  });

  describe.each([
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
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.apport_et_besoin[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.apport_et_besoin[attr]
      );
    });
  });

  describe.each([
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
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.ef_conso[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.ef_conso[attr]
      );
    });
  });

  describe.each([
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
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.ep_conso[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.ep_conso[attr]
      );
    });
  });

  describe.each([
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
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.emission_ges[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.emission_ges[attr]
      );
    });
  });

  describe.each([
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
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.cout[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.cout[attr]
      );
    });
  });

  describe.each([
    'production_pv',
    'conso_elec_ac',
    'conso_elec_ac_ch',
    'conso_elec_ac_ecs',
    'conso_elec_ac_fr',
    'conso_elec_ac_eclairage',
    'conso_elec_ac_auxiliaire',
    'conso_elec_ac_autre_usage'
  ])('check "production_electricite.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.production_electricite[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.production_electricite[attr]
      );
    });
  });

  describe.each([
    'sortie_par_energie',
    'conso_elec_ac',
    'conso_elec_ac_ch',
    'conso_elec_ac_ecs',
    'conso_elec_ac_fr',
    'conso_elec_ac_eclairage',
    'conso_elec_ac_auxiliaire',
    'conso_elec_ac_autre_usage'
  ])('check "sortie_par_energie_collection.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);

      expect(
        calculatedDpe.logement.sortie.sortie_par_energie_collection.sortie_par_energie
      ).toHaveLength(
        exceptedDpe.logement.sortie.sortie_par_energie_collection.sortie_par_energie.length
      );

      calculatedDpe.logement.sortie.sortie_par_energie_collection.sortie_par_energie.forEach(
        (sortie_par_energie, idx) => {
          expect(sortie_par_energie[attr]).toBeCloseTo(
            exceptedDpe.logement.sortie.sortie_par_energie_collection.sortie_par_energie[idx][attr]
          );
        }
      );
    });
  });

  describe.each([
    'isolation_toiture',
    'protection_solaire_exterieure',
    'aspect_traversant',
    'brasseur_air',
    'inertie_lourde',
    'enum_indicateur_confort_ete_id'
  ])('check "confort_ete.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.confort_ete[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.confort_ete[attr]
      );
    });
  });

  describe.each([
    'ubat',
    'qualite_isol_enveloppe',
    'qualite_isol_mur',
    'qualite_isol_plancher_haut_toit_terrasse',
    'qualite_isol_plancher_haut_comble_perdu',
    'qualite_isol_plancher_haut_comble_amenage',
    'qualite_isol_plancher_bas',
    'qualite_isol_menuiserie'
  ])('check "qualite_isolation.%s" value', (attr) => {
    test.each(corpus)('dpe %s', (ademeId) => {
      const exceptedDpe = getAdemeFileJson(ademeId);
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe.logement.sortie.qualite_isolation[attr]).toBeCloseTo(
        exceptedDpe.logement.sortie.qualite_isolation[attr]
      );
    });
  });
});
