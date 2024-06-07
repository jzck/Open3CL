import calc_bv from './3.3_baie_vitree.js';
import { PRECISION } from '../test/constant.js';

describe('Recherche de bugs dans le calcul de déperdition des baies vitrées', () => {
  test('calcul de déperdition pour les murs de 2187E0982013C baie 1', () => {
    const zc = 3;
    const bv = {
      donnee_entree: {
        description:
          'Fenêtre  1 Nord - Fenêtres battantes bois, orientées Nord, simple vitrage avec volets battants bois',
        enum_type_adjacence_id: '1',
        surface_totale_baie: 3.2,
        nb_baie: 1,
        tv_ug_id: 1,
        enum_type_vitrage_id: '1',
        enum_inclinaison_vitrage_id: '3',
        enum_methode_saisie_perf_vitrage_id: '1',
        tv_uw_id: 561,
        enum_type_materiaux_menuiserie_id: '3',
        enum_type_baie_id: '4',
        double_fenetre: 0,
        uw_1: 5.4,
        sw_1: 0.52,
        tv_deltar_id: 6,
        tv_ujn_id: 224,
        enum_type_fermeture_id: '7',
        presence_retour_isolation: 0,
        largeur_dormant: 5,
        tv_sw_id: 89,
        enum_type_pose_id: '3',
        enum_orientation_id: '2',
        tv_coef_masque_proche_id: 19,
        masque_lointain_non_homogene_collection: '',
        reference: 'baie_vitree_0',
        tv_coef_reduction_deperdition_id: 1
      },
      donnee_intermediaire: {
        b: 1,
        sw: 0.52,
        ug: 5.8,
        uw: 5.4,
        ujn: 3.8,
        u_menuiserie: 3.8,
        fe2: 1,
        fe1: 1
      }
    };

    calc_bv(bv, zc);

    expect(bv.donnee_intermediaire.b).toBe(1);
    expect(bv.donnee_intermediaire.ug).toBe(5.8);
    expect(bv.donnee_intermediaire.uw).toBe(5.4);
    expect(bv.donnee_intermediaire.ujn).toBe(3.8);
    expect(bv.donnee_intermediaire.u_menuiserie).toBe(3.8);
    expect(bv.donnee_intermediaire.sw).toBe(0.52);
    expect(bv.donnee_intermediaire.fe1).toBe(1);
    expect(bv.donnee_intermediaire.fe2).toBe(1);
  });

  test('calcul de déperdition pour les murs de 2187E0982013C baie 2', () => {
    const zc = 3;
    const bv = {
      donnee_entree: {
        description:
          "Fenêtre  2 Est - Fenêtres battantes bois, orientées Est, double vitrage avec lame d'air 12 mm et volets battants bois",
        enum_type_adjacence_id: '1',
        surface_totale_baie: 2.6,
        nb_baie: 2,
        tv_ug_id: 5,
        enum_type_vitrage_id: '2',
        enum_inclinaison_vitrage_id: '3',
        enum_type_gaz_lame_id: '1',
        epaisseur_lame: 12,
        vitrage_vir: 0,
        enum_methode_saisie_perf_vitrage_id: '1',
        tv_uw_id: 548,
        enum_type_materiaux_menuiserie_id: '3',
        enum_type_baie_id: '4',
        double_fenetre: 0,
        uw_1: 3,
        sw_1: 0.47000000000000003,
        tv_deltar_id: 6,
        tv_ujn_id: 201,
        enum_type_fermeture_id: '7',
        presence_retour_isolation: 0,
        largeur_dormant: 5,
        tv_sw_id: 90,
        enum_type_pose_id: '3',
        enum_orientation_id: '3',
        tv_coef_masque_proche_id: 19,
        masque_lointain_non_homogene_collection: ''
      },
      donnee_intermediaire: {
        b: 1,
        ug: 2.8,
        uw: 3,
        ujn: 2.4,
        u_menuiserie: 2.4,
        sw: 0.47000000000000003,
        fe1: 1,
        fe2: 1
      }
    };

    calc_bv(bv, zc);

    expect(bv.donnee_intermediaire.b).toBe(1);
    expect(bv.donnee_intermediaire.ug).toBe(2.8);
    expect(bv.donnee_intermediaire.uw).toBe(3);
    expect(bv.donnee_intermediaire.ujn).toBe(2.4);
    expect(bv.donnee_intermediaire.u_menuiserie).toBe(2.4);
    expect(bv.donnee_intermediaire.sw).toBeCloseTo(0.47000000000000003, PRECISION);
    expect(bv.donnee_intermediaire.fe1).toBe(1);
    expect(bv.donnee_intermediaire.fe2).toBe(1);
  });

  test('calcul de déperdition pour les murs de 2187E0982013C baie 3', () => {
    const zc = 3;
    const bv = {
      donnee_entree: {
        description:
          "Fenêtre  3 Est - Fenêtres battantes bois, orientées Est, double vitrage avec lame d'air 12 mm et volets battants bois",
        enum_type_adjacence_id: '1',
        surface_totale_baie: 4.5,
        nb_baie: 3,
        tv_ug_id: 5,
        enum_type_vitrage_id: '2',
        enum_inclinaison_vitrage_id: '3',
        enum_type_gaz_lame_id: '1',
        epaisseur_lame: 12,
        vitrage_vir: 0,
        enum_methode_saisie_perf_vitrage_id: '1',
        tv_uw_id: 548,
        enum_type_materiaux_menuiserie_id: '3',
        enum_type_baie_id: '4',
        double_fenetre: 0,
        uw_1: 3,
        sw_1: 0.47000000000000003,
        tv_deltar_id: 6,
        tv_ujn_id: 201,
        enum_type_fermeture_id: '7',
        presence_retour_isolation: 0,
        largeur_dormant: 5,
        tv_sw_id: 90,
        enum_type_pose_id: '3',
        enum_orientation_id: '3',
        tv_coef_masque_proche_id: 19,
        masque_lointain_non_homogene_collection: ''
      },
      donnee_intermediaire: {
        b: 1,
        ug: 2.8,
        uw: 3,
        ujn: 2.4,
        u_menuiserie: 2.4,
        sw: 0.47000000000000003,
        fe1: 1,
        fe2: 1
      }
    };

    calc_bv(bv, zc);

    expect(bv.donnee_intermediaire.b).toBe(1);
    expect(bv.donnee_intermediaire.ug).toBe(2.8);
    expect(bv.donnee_intermediaire.uw).toBe(3);
    expect(bv.donnee_intermediaire.ujn).toBe(2.4);
    expect(bv.donnee_intermediaire.u_menuiserie).toBe(2.4);
    expect(bv.donnee_intermediaire.sw).toBeCloseTo(0.47000000000000003, PRECISION);
    expect(bv.donnee_intermediaire.fe1).toBe(1);
    expect(bv.donnee_intermediaire.fe2).toBe(1);
  });

  test('calcul de déperdition pour les murs de 2187E0982013C baie 4', () => {
    const zc = 3;
    const bv = {
      donnee_entree: {
        description:
          "Fenêtre  4 Ouest - Fenêtres battantes bois, orientées Ouest, double vitrage avec lame d'air 12 mm et volets battants bois",
        enum_type_adjacence_id: '1',
        surface_totale_baie: 3.84,
        nb_baie: 4,
        tv_ug_id: 5,
        enum_type_vitrage_id: '2',
        enum_inclinaison_vitrage_id: '3',
        enum_type_gaz_lame_id: '1',
        epaisseur_lame: 12,
        vitrage_vir: 0,
        enum_methode_saisie_perf_vitrage_id: '1',
        tv_uw_id: 548,
        enum_type_materiaux_menuiserie_id: '3',
        enum_type_baie_id: '4',
        double_fenetre: 0,
        uw_1: 3,
        sw_1: 0.47000000000000003,
        tv_deltar_id: 6,
        tv_ujn_id: 201,
        enum_type_fermeture_id: '7',
        presence_retour_isolation: 0,
        largeur_dormant: 5,
        tv_sw_id: 90,
        enum_type_pose_id: '3',
        enum_orientation_id: '4',
        tv_coef_masque_proche_id: 19,
        masque_lointain_non_homogene_collection: ''
      },
      donnee_intermediaire: {
        b: 1,
        ug: 2.8,
        uw: 3,
        ujn: 2.4,
        u_menuiserie: 2.4,
        sw: 0.47000000000000003,
        fe1: 1,
        fe2: 1
      }
    };

    calc_bv(bv, zc);

    expect(bv.donnee_intermediaire.b).toBe(1);
    expect(bv.donnee_intermediaire.ug).toBe(2.8);
    expect(bv.donnee_intermediaire.uw).toBe(3);
    expect(bv.donnee_intermediaire.ujn).toBe(2.4);
    expect(bv.donnee_intermediaire.u_menuiserie).toBe(2.4);
    expect(bv.donnee_intermediaire.sw).toBeCloseTo(0.47000000000000003, PRECISION);
    expect(bv.donnee_intermediaire.fe1).toBe(1);
    expect(bv.donnee_intermediaire.fe2).toBe(1);
  });

  test('calcul de déperdition pour les murs de 2187E0982013C baie 5', () => {
    const zc = 3;
    const bv = {
      donnee_entree: {
        description:
          "Fenêtre  5 Ouest - Fenêtres battantes bois, orientées Ouest, double vitrage avec lame d'air 12 mm",
        enum_type_adjacence_id: '1',
        surface_totale_baie: 0.4,
        nb_baie: 1,
        tv_ug_id: 5,
        enum_type_vitrage_id: '2',
        enum_inclinaison_vitrage_id: '3',
        enum_type_gaz_lame_id: '1',
        epaisseur_lame: 12,
        vitrage_vir: 0,
        enum_methode_saisie_perf_vitrage_id: '1',
        tv_uw_id: 548,
        enum_type_materiaux_menuiserie_id: '3',
        enum_type_baie_id: '4',
        double_fenetre: 0,
        uw_1: 3,
        sw_1: 0.47000000000000003,
        enum_type_fermeture_id: '1',
        presence_retour_isolation: 0,
        largeur_dormant: 5,
        tv_sw_id: 90,
        enum_type_pose_id: '3',
        enum_orientation_id: '4',
        tv_coef_masque_proche_id: 19,
        masque_lointain_non_homogene_collection: ''
      },
      donnee_intermediaire: {
        b: 1,
        ug: 2.8,
        uw: 3,
        u_menuiserie: 3,
        sw: 0.47000000000000003,
        fe1: 1,
        fe2: 1
      }
    };

    calc_bv(bv, zc);

    expect(bv.donnee_intermediaire.b).toBe(1);
    expect(bv.donnee_intermediaire.ug).toBe(2.8);
    expect(bv.donnee_intermediaire.uw).toBe(3);
    expect(bv.donnee_intermediaire.u_menuiserie).toBe(3);
    expect(bv.donnee_intermediaire.sw).toBeCloseTo(0.47000000000000003, PRECISION);
    expect(bv.donnee_intermediaire.fe1).toBe(1);
    expect(bv.donnee_intermediaire.fe2).toBe(1);
  });

  test('calcul de déperdition pour les murs de 2187E0982013C baie 6', () => {
    const zc = 3;
    const bv = {
      donnee_entree: {
        description: 'Fenêtre  6 Ouest - Fenêtres battantes bois, orientées Ouest, simple vitrage',
        enum_type_adjacence_id: '1',
        surface_totale_baie: 0.16,
        nb_baie: 1,
        tv_ug_id: 1,
        enum_type_vitrage_id: '1',
        enum_inclinaison_vitrage_id: '3',
        enum_methode_saisie_perf_vitrage_id: '1',
        tv_uw_id: 562,
        enum_type_materiaux_menuiserie_id: '3',
        enum_type_baie_id: '4',
        double_fenetre: 0,
        uw_1: 5.4,
        sw_1: 0.52,
        enum_type_fermeture_id: '1',
        presence_retour_isolation: 0,
        largeur_dormant: 5,
        tv_sw_id: 89,
        enum_type_pose_id: '3',
        enum_orientation_id: '4',
        tv_coef_masque_proche_id: 19,
        masque_lointain_non_homogene_collection: ''
      },
      donnee_intermediaire: {
        b: 1,
        ug: 5.8,
        uw: 5.4,
        u_menuiserie: 5.4,
        sw: 0.52,
        fe1: 1,
        fe2: 1
      }
    };

    calc_bv(bv, zc);

    expect(bv.donnee_intermediaire.b).toBe(1);
    expect(bv.donnee_intermediaire.ug).toBe(5.8);
    expect(bv.donnee_intermediaire.uw).toBe(5.4);
    expect(bv.donnee_intermediaire.u_menuiserie).toBe(5.4);
    expect(bv.donnee_intermediaire.sw).toBe(0.52);
    expect(bv.donnee_intermediaire.fe1).toBe(1);
    expect(bv.donnee_intermediaire.fe2).toBe(1);
  });
});
