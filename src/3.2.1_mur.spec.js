import calc_mur from './3.2.1_mur.js';

describe('Recherche de bugs dans le calcul de déperdition des murs', () => {
  /**
   * @see : https://redfroggy.atlassian.net/browse/KAR-119
   */
  test('calcul de déperdition pour les murs de 2213E0696993Z', () => {
    const zc = 8; // H3
    const pc_id = 2; // Période de construction (1948)
    const ej = 0;
    const mur = {
      donnee_entree: {
        description:
          "Mur  2 Est - Inconnu donnant sur des circulations sans ouverture directe sur l'extérieur",
        reference: '2021_08_24_18_02_58_7233440008111783',
        tv_coef_reduction_deperdition_id: 78,
        surface_aiu: 22,
        surface_aue: 15,
        enum_cfg_isolation_lnc_id: '2',
        enum_type_adjacence_id: '14', // Circulation sans ouverture directe sur l'extérieur
        enum_orientation_id: '3', // Est
        surface_paroi_totale: 10.5,
        surface_paroi_opaque: 10.5,
        tv_umur0_id: 1,
        enum_materiaux_structure_mur_id: '1', // Inconnu
        enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
        paroi_ancienne: 0,
        enum_type_doublage_id: '2', // absence de doublage
        enum_type_isolation_id: '1', // inconnu
        enum_periode_isolation_id: '2', // 1948-1974
        tv_umur_id: 6, //
        enum_methode_saisie_u_id: '8' // année de construction saisie (table forfaitaire)
      },
      donnee_intermediaire: {
        b: 0.35,
        umur: 2.5,
        umur0: 2.5
      }
    };
    calc_mur(mur, zc, pc_id, ej);

    expect(mur.donnee_intermediaire.b).toBe(0.35);
    expect(mur.donnee_intermediaire.umur).toBe(2.5);
    expect(mur.donnee_intermediaire.umur0).toBe(2.5);
  });

  test('calcul de déperdition pour les murs de 2187E0982013C', () => {
    const zc = 3;
    const pc_id = 1;
    const ej = 0;
    const mur = {
      donnee_entree: {
        description:
          "Mur Nord, Sud, Est, Ouest - Mur en pierre de taille et moellons avec remplissage tout venant d'épaisseur 50 cm non isolé donnant sur l'extérieur",
        enum_type_adjacence_id: '1', // Extérieur
        enum_orientation_id: '4', // Sud-Ouest
        surface_paroi_totale: 134.76,
        surface_paroi_opaque: 134.76,
        tv_umur0_id: 15,
        enum_materiaux_structure_mur_id: '3', // Murs en pierre de taille et moellons avec remplissage tout venant
        enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
        paroi_ancienne: 1,
        enum_type_doublage_id: '2', // absence de doublage
        enum_type_isolation_id: '2', // Non isolé
        enum_methode_saisie_u_id: '1' // non isolé
      },
      donnee_intermediaire: {
        b: 1,
        umur: 0.81545,
        umur0: 0.81545
      }
    };
    calc_mur(mur, zc, pc_id, ej);

    expect(mur.donnee_intermediaire.b).toBe(1);
    expect(mur.donnee_intermediaire.umur).toBe(1.9);
    expect(mur.donnee_intermediaire.umur0).toBe(1.9);
  });

  describe('calcul de déperdition pour les murs de 2387E0045247S', () => {
    test('Mur  2 Est', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  2 Est - Mur en pierre de taille et moellons avec remplissage tout venant d'épaisseur 50 cm avec un doublage rapporté non isolé donnant sur un garage",
          reference: '2023_01_05_11_43_33_3939838001416257',
          reference_lnc: 'LNC2023_01_05_11_43_33_3939838001416257',
          tv_coef_reduction_deperdition_id: 105,
          surface_aiu: 29,
          surface_aue: 120,
          enum_cfg_isolation_lnc_id: '2', // lc non isolé + lnc non isolé
          enum_type_adjacence_id: '8', // Garage
          enum_orientation_id: '3', // Est
          surface_paroi_totale: 29,
          surface_paroi_opaque: 29,
          tv_umur0_id: 15,
          epaisseur_structure: 50,
          enum_materiaux_structure_mur_id: '3', // Mur en pierre de taille et moellons avec remplissage tout venant
          enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
          paroi_ancienne: 1,
          enum_type_doublage_id: '4', // doublage indéterminé avec lame d'air sup 15 mm
          enum_type_isolation_id: '2', // Non isolé
          enum_methode_saisie_u_id: '1' // Non isolé
        },
        donnee_intermediaire: {
          b: 0.9,
          umur: 0.6962300000000001,
          umur0: 0.69623
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      /**
       * umur0 = 1.9 ++ Correction liée au doublage
       *
       * Pour un mur avec un doublage rapporté avec une lame d’air de plus de 15 mm ou avec un matériau de doublage
       * connu (plâtre, brique, bois) : Rdoublage = 0,21 m2.K/W
       * umur0_corrige = 1 / ((1 / 1.9) + 0.21) = 1,358112938
       */

      expect(mur.donnee_intermediaire.b).toBe(0.9);
      expect(mur.donnee_intermediaire.umur).toBeCloseTo(1.3581129378127235);
      expect(mur.donnee_intermediaire.umur0).toBeCloseTo(1.3581129378127235);
    });
  });

  describe('calcul de déperdition pour les murs de 2287E2336469P', () => {
    test('Mur  1 Est', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  1 Est - Mur en pierre de taille et moellons avec remplissage tout venant d'épaisseur 50 cm non isolé donnant sur l'extérieur",
          reference: '2022_10_09_17_17_06_68960810009669888',
          reference_lnc: '',
          tv_coef_reduction_deperdition_id: 1,
          enum_type_adjacence_id: '1', // Exterieur
          enum_orientation_id: '3', // Est
          surface_paroi_totale: 44.22,
          surface_paroi_opaque: 44.22,
          tv_umur0_id: 15,
          epaisseur_structure: 50,
          enum_materiaux_structure_mur_id: '3', // Mur en pierre de taille et moellons avec remplissage tout venant
          enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
          paroi_ancienne: 1,
          enum_type_doublage_id: '2', // absence de doublage
          enum_type_isolation_id: '2', // Non isolé
          enum_methode_saisie_u_id: '1' // non isolé
        },
        donnee_intermediaire: {
          b: 1,
          umur: 0.81545,
          umur0: 0.81545
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      expect(mur.donnee_intermediaire.b).toBe(1);
      expect(mur.donnee_intermediaire.umur).toBe(1.9);
      expect(mur.donnee_intermediaire.umur0).toBe(1.9);
    });
  });

  describe('calcul de déperdition pour les murs de 2287E1724516Y', () => {
    test('Mur  3 Sud', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  3 Sud - Mur en pierre de taille et moellons avec remplissage tout venant d'épaisseur 65 cm non isolé donnant sur l'extérieur",
          reference: '2022_07_28_05_53_52_4113671002758088',
          tv_coef_reduction_deperdition_id: 1,
          enum_type_adjacence_id: '1',
          enum_orientation_id: '1',
          surface_paroi_totale: 16,
          surface_paroi_opaque: 16,
          tv_umur0_id: 18,
          epaisseur_structure: 65,
          enum_materiaux_structure_mur_id: '3',
          enum_methode_saisie_u0_id: '2',
          paroi_ancienne: 1,
          enum_type_doublage_id: '2',
          enum_type_isolation_id: '2',
          enum_methode_saisie_u_id: '1'
        },
        donnee_intermediaire: {
          b: 1,
          umur: 1.5,
          umur0: 1.5
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      expect(mur.donnee_intermediaire.b).toBe(1);
      expect(mur.donnee_intermediaire.umur).toBe(1.5);
      expect(mur.donnee_intermediaire.umur0).toBe(1.5);
    });

    test('Mur  4 Nord, Sud (p1)', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  4 Nord, Sud (p1) - Mur en pan de bois sans remplissage tout venant d'épaisseur 18 cm avec isolation intérieure (R=2.5m².K/W) donnant sur l'extérieur",
          reference: '2022_07_28_05_58_44_4984876005871074',
          tv_coef_reduction_deperdition_id: 1,
          enum_type_adjacence_id: '1',
          enum_orientation_id: '2',
          surface_paroi_totale: 10.4,
          surface_paroi_opaque: 10.4,
          tv_umur0_id: 34,
          epaisseur_structure: 18,
          enum_materiaux_structure_mur_id: '5', // Murs en pan de bois sans remplissage tout venant
          enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
          paroi_ancienne: 1,
          enum_type_doublage_id: '2', // absence de doublage
          enum_type_isolation_id: '3', // ITI
          resistance_isolation: 2.5,
          enum_methode_saisie_u_id: '6' // Resistance isolation saisie justifiée  à partir des documents justificatifs autorisés
        },
        donnee_intermediaire: {
          b: 1,
          umur: 0.26990177584075975,
          umur0: 0.8298399999999999
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      /**
       * umur_nu = 1.98
       * umur = 1 / ((1/1.98) + 2.5)
       * 0,332773109
       */

      expect(mur.donnee_intermediaire.b).toBe(1);
      expect(mur.donnee_intermediaire.umur).toBe(0.33277310924369746); // 0.33277310924369746
      expect(mur.donnee_intermediaire.umur0).toBe(1.98); // 1.98
    });

    test('Mur  5 Nord, Sud, Ouest (p1)', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  5 Nord, Sud, Ouest (p1) - Mur en pan de bois sans remplissage tout venant d'épaisseur 18 cm non isolé donnant sur l'extérieur",
          reference: '2022_07_28_06_01_47_5625698002679778',
          tv_coef_reduction_deperdition_id: 1,
          enum_type_adjacence_id: '1',
          enum_orientation_id: '2',
          surface_paroi_totale: 8.93,
          surface_paroi_opaque: 8.93,
          tv_umur0_id: 34,
          epaisseur_structure: 18,
          enum_materiaux_structure_mur_id: '5',
          enum_methode_saisie_u0_id: '2',
          paroi_ancienne: 1,
          enum_type_doublage_id: '2',
          enum_type_isolation_id: '2',
          enum_methode_saisie_u_id: '1'
        },
        donnee_intermediaire: {
          b: 1,
          umur: 0.8298399999999999,
          umur0: 0.8298399999999999
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      expect(mur.donnee_intermediaire.b).toBe(1);
      expect(mur.donnee_intermediaire.umur).toBe(1.98); // 1.98
      expect(mur.donnee_intermediaire.umur0).toBe(1.98); // 1.98
    });

    test('Mur  6 Nord', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  6 Nord - Mur en pan de bois sans remplissage tout venant d'épaisseur 18 cm avec isolation intérieure (R=1.12m².K/W) donnant sur l'extérieur",
          reference: '2022_07_28_06_12_33_8743390001467784',
          tv_coef_reduction_deperdition_id: 1,
          enum_type_adjacence_id: '1',
          enum_orientation_id: '2',
          surface_paroi_totale: 7.39,
          surface_paroi_opaque: 7.39,
          tv_umur0_id: 34,
          epaisseur_structure: 18,
          enum_materiaux_structure_mur_id: '5',
          enum_methode_saisie_u0_id: '2',
          paroi_ancienne: 1,
          enum_type_doublage_id: '2',
          enum_type_isolation_id: '3',
          resistance_isolation: 1.12,
          enum_methode_saisie_u_id: '6'
        },
        donnee_intermediaire: {
          b: 1,
          umur: 0.4300979858826027,
          umur0: 0.8298399999999999
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      /**
       * umur_nu = 1.98
       * umur = 1 / ((1/1.98) + 1.12)
       * 0,61536549
       */

      expect(mur.donnee_intermediaire.b).toBe(1);
      expect(mur.donnee_intermediaire.umur).toBe(0.6153654898060665);
      expect(mur.donnee_intermediaire.umur0).toBe(1.98);
    });
  });

  describe('calcul de déperdition pour les murs de 2287E1327399F', () => {
    test('Mur  1 Nord', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const mur = {
        donnee_entree: {
          description:
            "Mur  1 Nord - Mur en pierre de taille et moellons avec remplissage tout venant d'épaisseur 60 cm avec isolation intérieure (R=3,7m².K/W) donnant sur un bâtiment ou local à usage autre que d'habitation",
          reference: '2022_06_15_14_48_45_6578917004465132',
          tv_coef_reduction_deperdition_id: 4,
          enum_type_adjacence_id: '4', // Bâtiment ou local à usage autre que d'habitation
          enum_orientation_id: '2', // Nord
          surface_paroi_totale: 48.39,
          surface_paroi_opaque: 48.39,
          tv_umur0_id: 17,
          epaisseur_structure: 60,
          enum_materiaux_structure_mur_id: '3', // Murs en pierre de taille et moellons avec remplissage tout venant
          enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
          paroi_ancienne: 1,
          enum_type_doublage_id: '2', // absence de doublage
          enum_type_isolation_id: '3', // ITI
          resistance_isolation: 3.7,
          enum_methode_saisie_u_id: '6' // Resistance isolation saisie justifiée  à partir des documents justificatifs autorisés
        },
        donnee_intermediaire: {
          b: 0.2,
          umur: 0.19900518501955455,
          umur0: 0.7547200000000001
        }
      };
      calc_mur(mur, zc, pc_id, ej);

      /**
       * A LA MAIN
       * uMur0 = 1.6
       * umur_nu = Min(uMur0; 2.5) = 1.6
       * umur = 1 / ((1/umur_nu)+Risolant) = 1 / ((1 / 1.6) + 3.7) = 0,231213873
       */

      /**
       * RETOUR CALCUL LIB
       * "donnee_intermediaire": {
       *  "umur0": 1.6,
       *  "b": 0.2,
       *  "umur": 0.23121387283236994
       *  },
       */
      expect(mur.donnee_intermediaire.b).toBe(0.2);
      expect(mur.donnee_intermediaire.umur).toBeCloseTo(0.231213873);
      expect(mur.donnee_intermediaire.umur0).toBe(1.6);
    });
  });
});
