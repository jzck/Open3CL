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
});
