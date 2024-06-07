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
});
