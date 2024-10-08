import { Inertie } from './7_inertie.js';

describe('Inertie unit tests', () => {
  /**
   * @see : Methode_de_calcul_3CL_DPE_2021-338.pdf Page 53
   */
  const inertie = new Inertie();

  it.each([
    [1, 1, 0, 9],
    [1, 1, 0, 11],
    [1, 1, 0, 12],
    [0, 1, 0, 10],
    [1, 0, 2, 9],
    [1, 0, 4, 9],
    [1, 0, 9, 9],
    [0, 0, 9, 10],
    [0, 0, 3, 9],
    [0, 0, 3, 9]
  ])(
    'should get inertie %s for plancher_bas with methode_saisie_u %s, type_isolation_id %s and type_plancher_bas %s',
    (
      inertie_result,
      enum_methode_saisie_u_id,
      enum_type_isolation_id,
      enum_type_plancher_bas_id
    ) => {
      const de = {
        enum_methode_saisie_u_id,
        enum_type_isolation_id,
        enum_type_plancher_bas_id
      };
      expect(inertie.calculateInertiePbLourd(de)).toBe(inertie_result);
    }
  );

  it.each([
    [1, 2, 8],
    [1, 4, 8],
    [1, 9, 8],
    [0, 1, 8],
    [1, 2, 8],
    [1, 2, 11],
    [0, 3, 8]
  ])(
    'should get inertie %s for plancher_haut with type_isolation_id %s and type_plancher_haut %s',
    (inertie_result, enum_type_isolation_id, enum_type_plancher_haut_id) => {
      const de = {
        enum_type_isolation_id,
        enum_type_plancher_haut_id
      };
      expect(inertie.calculateInertiePhLourd(de)).toBe(inertie_result);
    }
  );

  it.each([
    [1, 1, 0, 2, 0],
    [1, 1, 0, 3, 0],
    [1, 1, 0, 4, 0],
    [1, 1, 0, 19, 0],
    [1, 0, 2, 19, 0],
    [1, 0, 4, 19, 0],
    [1, 0, 9, 19, 0],
    [0, 0, 1, 19, 0],
    [1, 1, 0, 11, 8.3],
    [1, 1, 0, 13, 8.3],
    [0, 1, 0, 11, 6.2],
    [0, 1, 0, 13, 6.2],
    [1, 1, 0, 12, 11.3],
    [0, 1, 0, 12, 9.2],
    [1, 1, 0, 8, 10.6],
    [0, 1, 0, 8, 9.2],
    [1, 1, 0, 9, 10.6],
    [0, 1, 0, 9, 9.2],
    [1, 1, 0, 10, 10.6],
    [0, 1, 0, 10, 9.2],
    [1, 1, 0, 15, 10.6],
    [0, 1, 0, 15, 9.2],
    [0, 0, 0, 15, 9.2]
  ])(
    'should get inertie %s for mur with methode_saisie_u %s, type_isolation_id %s, materiaux_structure_mur %s and epaisseur_structure %s',
    (
      inertie_result,
      enum_methode_saisie_u_id,
      enum_type_isolation_id,
      enum_materiaux_structure_mur_id,
      epaisseur_structure
    ) => {
      const de = {
        enum_methode_saisie_u_id,
        enum_type_isolation_id,
        enum_materiaux_structure_mur_id,
        epaisseur_structure
      };
      expect(inertie.calculateInertieMurLourd(de)).toBe(inertie_result);
    }
  );

  test('should get inertie for mur getting epaisseur_structure from description', () => {
    const de = {
      enum_type_isolation_id: 2,
      enum_materiaux_structure_mur_id: 12
    };
    expect(inertie.calculateInertieMurLourd(de)).toBe(0);

    de.description = "Mur en blocs de béton creux d'&apos;'épaisseur ≥ 25 cm non isolé";
    expect(inertie.calculateInertieMurLourd(de)).toBe(1);

    de.description = "Mur en blocs de béton creux d'épaisseur 4 cm non isolé";
    expect(inertie.calculateInertieMurLourd(de)).toBe(0);

    de.description = 'Mur en blocs de béton creux';
    expect(inertie.calculateInertieMurLourd(de)).toBe(0);
  });

  test('should get inertie for plancher_bas with the majority surface', () => {
    const enveloppe = {
      plancher_bas_collection: {
        plancher_bas: [
          {
            donnee_entree: {
              enum_methode_saisie_u_id: 1,
              enum_type_plancher_bas_id: 9,
              surface_paroi_opaque: 100
            }
          },
          {
            donnee_entree: {
              enum_methode_saisie_u_id: 0,
              enum_type_plancher_bas_id: 9,
              surface_paroi_opaque: 25
            }
          }
        ]
      },
      plancher_haut_collection: {},
      mur_collection: {}
    };
    // surface plancher_bas_lourd > 0.5 * surface plancher_bas
    expect(inertie.calculateInertie(enveloppe).inertie_plancher_bas_lourd).toBe(1);

    enveloppe.plancher_bas_collection.plancher_bas[0].donnee_entree.surface_paroi_opaque = 18;

    // surface plancher_bas_lourd < 0.5 * surface plancher_bas
    expect(inertie.calculateInertie(enveloppe).inertie_plancher_bas_lourd).toBe(0);
  });

  test('should get inertie for plancher_haut with the majority surface', () => {
    const enveloppe = {
      plancher_haut_collection: {
        plancher_haut: [
          {
            donnee_entree: {
              enum_type_isolation_id: 2,
              enum_type_plancher_haut_id: 8,
              surface_paroi_opaque: 100
            }
          },
          {
            donnee_entree: {
              enum_type_isolation_id: 0,
              enum_type_plancher_haut_id: 8,
              surface_paroi_opaque: 25
            }
          }
        ]
      },
      plancher_bas_collection: {},
      mur_collection: {}
    };
    // surface plancher_haut_lourd > 0.5 * surface plancher_haut
    expect(inertie.calculateInertie(enveloppe).inertie_plancher_haut_lourd).toBe(1);

    enveloppe.plancher_haut_collection.plancher_haut[0].donnee_entree.surface_paroi_opaque = 18;

    // surface plancher_haut_lourd < 0.5 * surface plancher_haut
    expect(inertie.calculateInertie(enveloppe).inertie_plancher_haut_lourd).toBe(0);
  });

  test('should get inertie for mur with the majority surface', () => {
    const enveloppe = {
      mur_collection: {
        mur: [
          {
            donnee_entree: {
              enum_type_isolation_id: 2,
              enum_materiaux_structure_mur_id: 2,
              surface_paroi_opaque: 100
            }
          },
          {
            donnee_entree: {
              enum_type_isolation_id: 1,
              enum_materiaux_structure_mur_id: 2,
              surface_paroi_opaque: 25
            }
          }
        ]
      },
      plancher_bas_collection: {},
      plancher_haut_collection: {}
    };
    // surface mur_lourd > 0.5 * surface mur
    expect(inertie.calculateInertie(enveloppe).inertie_paroi_verticale_lourd).toBe(1);

    enveloppe.mur_collection.mur[0].donnee_entree.surface_paroi_opaque = 18;

    // surface mur_lourd < 0.5 * surface mur
    expect(inertie.calculateInertie(enveloppe).inertie_paroi_verticale_lourd).toBe(0);
  });

  test('should get enum_classe_inertie_id', () => {
    const enveloppe = {
      mur_collection: {
        mur: [
          {
            donnee_entree: {
              enum_type_isolation_id: 2,
              enum_materiaux_structure_mur_id: 2,
              surface_paroi_opaque: 100
            }
          }
        ]
      },
      plancher_bas_collection: {
        plancher_bas: [
          {
            donnee_entree: {
              enum_type_isolation_id: 2,
              enum_type_plancher_bas_id: 9,
              surface_paroi_opaque: 100
            }
          }
        ]
      },
      plancher_haut_collection: {
        plancher_haut: [
          {
            donnee_entree: {
              enum_type_isolation_id: 2,
              enum_type_plancher_haut_id: 8,
              surface_paroi_opaque: 100
            }
          }
        ]
      }
    };
    // inertie_plancher_bas_lourd = 1 + inertie_plancher_haut_lourd = 1 + inertie_paroi_verticale_lourd = 1
    expect(inertie.calculateInertie(enveloppe).enum_classe_inertie_id).toBe('1');

    // inertie_plancher_bas_lourd = 1 + inertie_plancher_haut_lourd = 1 + inertie_paroi_verticale_lourd = 0
    enveloppe.mur_collection.mur[0].donnee_entree.enum_type_isolation_id = 0;
    expect(inertie.calculateInertie(enveloppe).enum_classe_inertie_id).toBe('2');

    // inertie_plancher_bas_lourd = 1 + inertie_plancher_haut_lourd = 0 + inertie_paroi_verticale_lourd = 0
    enveloppe.plancher_haut_collection.plancher_haut[0].donnee_entree.enum_type_isolation_id = 0;
    expect(inertie.calculateInertie(enveloppe).enum_classe_inertie_id).toBe('3');

    // inertie_plancher_bas_lourd = 0 + inertie_plancher_haut_lourd = 0 + inertie_paroi_verticale_lourd = 0
    enveloppe.plancher_bas_collection.plancher_bas[0].donnee_entree.enum_type_isolation_id = 0;
    expect(inertie.calculateInertie(enveloppe).enum_classe_inertie_id).toBe('4');
  });
});
