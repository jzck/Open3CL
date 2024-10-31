import { calcul_3cl } from '../src/engine.js';
import corpus from './corpus.json';
import { jest } from '@jest/globals';
import { getAdemeFileJson, getResultFile, saveResultFile } from './test-helpers.js';

describe('Test DPE validators', () => {
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

  test('DPE must be parsed without plancher_bas if pont_thermique_collection is empty or does not concern plancher_bas', () => {
    const dpe = getAdemeFileJson('2187E0981996L');
    dpe.logement.enveloppe.plancher_bas_collection = null;

    let calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).toBeNull();

    dpe.logement.enveloppe.plancher_bas_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = null;

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).toBeNull();

    dpe.logement.enveloppe.plancher_bas_collection = null;
    dpe.logement.sortie.deperdition.deperdition_plancher_bas = 0;

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).not.toBeNull();

    dpe.logement.enveloppe.plancher_bas_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = {};

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).not.toBeNull();

    dpe.logement.enveloppe.plancher_bas_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = {
      pont_thermique: [
        {
          donnee_entree: {
            description: '',
            enum_methode_saisie_pont_thermique_id: 1,
            enum_type_liaison_id: 1
          }
        }
      ]
    };

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).toBeNull();

    dpe.logement.enveloppe.plancher_bas_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = {
      pont_thermique: [
        {
          donnee_entree: {
            description: '',
            enum_methode_saisie_pont_thermique_id: 1,
            enum_type_liaison_id: 3
          }
        }
      ]
    };

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).not.toBeNull();
  });

  test('DPE must be parsed without plancher_haut if pont_thermique_collection is empty or does not concern plancher_haut', () => {
    const dpe = getAdemeFileJson('2187E0981996L');
    dpe.logement.enveloppe.plancher_haut_collection = null;

    let calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).toBeNull();

    dpe.logement.enveloppe.plancher_haut_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = null;

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).toBeNull();

    dpe.logement.enveloppe.plancher_haut_collection = null;
    dpe.logement.sortie.deperdition.deperdition_plancher_haut = 0;

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).not.toBeNull();

    dpe.logement.enveloppe.plancher_haut_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = {};

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).not.toBeNull();

    dpe.logement.enveloppe.plancher_haut_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = {
      pont_thermique: [
        {
          donnee_entree: {
            description: '',
            enum_methode_saisie_pont_thermique_id: 1,
            enum_type_liaison_id: 3
          }
        }
      ]
    };

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).toBeNull();

    dpe.logement.enveloppe.plancher_haut_collection = null;
    dpe.logement.enveloppe.pont_thermique_collection = {
      pont_thermique: [
        {
          donnee_entree: {
            description: '',
            enum_methode_saisie_pont_thermique_id: 1,
            enum_type_liaison_id: 1
          }
        }
      ]
    };

    calculatedDpe = calcul_3cl(dpe);
    expect(calculatedDpe).not.toBeNull();
  });

  test.each(['2475E3702442Q', '2492E1256472N', '2494E3676842T'])(
    'DPE %ademeId should be parsed without plancher_bas or plancher_haut',
    (ademeId) => {
      const calculatedDpe = getResultFile(ademeId);
      expect(calculatedDpe).not.toBeNull();
    }
  );
});
