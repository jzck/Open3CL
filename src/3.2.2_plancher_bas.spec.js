import calc_pb from './3.2.2_plancher_bas.js';

describe('Recherche de bugs dans le calcul de déperdition des planchers bas', () => {
  describe('calcul de déperdition pour les planchers bas de 2287E1043883T', () => {
    test('Mur  1 Nord', () => {
      const zc = 3;
      const pc_id = 1;
      const ej = 0;
      const pb1 = {
        donnee_entree: {
          description:
            'Plancher  1 - Plancher lourd type entrevous terre-cuite, poutrelles béton donnant sur un sous-sol non chauffé avec isolation intrinsèque ou en sous-face (5 cm)',
          reference: '2022_05_11_17_10_23_1067244006611344',
          tv_coef_reduction_deperdition_id: 6,
          enum_type_adjacence_id: '6',
          surface_paroi_opaque: 42.08,
          tv_upb0_id: 11,
          enum_type_plancher_bas_id: '11',
          enum_methode_saisie_u0_id: '2',
          enum_type_isolation_id: '4',
          epaisseur_isolation: 5,
          enum_methode_saisie_u_id: '3',
          calcul_ue: 1,
          perimetre_ue: 27,
          surface_ue: 42.08,
          ue: 0.37117494
        },
        donnee_intermediaire: {
          b: 1,
          upb: 0.5915492957746479,
          upb_final: 0.37117494,
          upb0: 2
        }
      };

      const pb = {
        donnee_entree: {
          description: 'Plancher  2 - Dalle béton donnant sur un terre-plein',
          reference: '2022_05_11_17_10_51_2415353009491032',
          tv_coef_reduction_deperdition_id: 5,
          enum_type_adjacence_id: '5', // Terre-Plein
          surface_paroi_opaque: 24.34,
          tv_upb0_id: 9,
          enum_type_plancher_bas_id: '9', // Dalle béton
          enum_methode_saisie_u0_id: '2', // déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire
          enum_type_isolation_id: '1', // inconnu
          enum_periode_isolation_id: '1', // avant 1948
          tv_upb_id: 2,
          enum_methode_saisie_u_id: '8', // année de construction saisie (table forfaitaire)
          calcul_ue: 1,
          perimetre_ue: 22,
          surface_ue: 24.34,
          ue: 0.61789474
        },
        donnee_intermediaire: {
          b: 1,
          upb: 2,
          upb_final: 0.61789474,
          upb0: 2
        }
      };
      const pb_list = [pb1, pb];

      /**
       * Sortie lib (différence)
       * tv_upb_id: 8       (2 dans dpe origine)
       * ue: 0.44           (0.61789474 dans dpe origine)
       * upb: 0.9           (2 dans dpe origine)
       * upb_final: 0.44    (0.61789474 dans dpe origine)
       */
      calc_pb(pb, zc, pc_id, ej, pb_list);

      /**
       * P = 22
       * S = 24.34
       * 2S/P = (2 * 24.34) / 22 = 2,212727273 = 2 (arrondi à l'entier le plus proche)
       * upb0 = 2
       * upb = Min(upb0; upbtab) = Min(2; 2) = 2
       * ue = Umoyen pour tous les planchers du batiment
       * upb_final = ue
       */
      expect(pb.donnee_intermediaire.b).toBe(1);
      expect(pb.donnee_intermediaire.upb0).toBe(2);
      expect(pb.donnee_intermediaire.upb).toBe(2);
      expect(pb.donnee_intermediaire.upb_final).toBe(pb.donnee_entree.ue);
    });
  });
});
