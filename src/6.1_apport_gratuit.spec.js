import { calc_ai, calc_as } from './6.1_apport_gratuit.js';

describe("Recherche de bugs dans le calcul de l'apport gratuit", () => {
  /**
   * @see : Methode_de_calcul_3CL_DPE_2021-338.pdf Page 43
   */
  test('calcul de f apport solaire', () => {
    const ilpa = '0';
    const ca = '400-800m';
    const zc = 'h1c';
    const bv = [
      {
        donnee_entree: {
          description: 'Fenêtre  1 Nord - Fenêtres battantes bois, orientées Nord, simple vitrage',
          enum_type_adjacence_id: '1',
          surface_totale_baie: 1.76,
          nb_baie: 2,
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
          enum_type_fermeture_id: '1',
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
          u_menuiserie: 5.4,
          fe2: 1,
          fe1: 1
        },
        donnee_utilisateur: {
          enum_type_adjacence_id: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22'
          ],
          enum_type_vitrage_id: ['1', '2', '3', '4', '5', '6'],
          enum_type_baie_id: ['1', '2', '3', '4', '5', '6', '7', '8'],
          enum_type_materiaux_menuiserie_id: ['1', '2', '3', '4', '5', '6', '7'],
          vitrage_vir: 'bool',
          enum_type_pose_id: ['1', '2', '3', '4'],
          enum_type_fermeture_id: ['1', '2', '3', '4', '5', '6', '7', '8'],
          presence_retour_isolation: 'bool',
          largeur_dormant: 'float'
        }
      },
      {
        donnee_entree: {
          description:
            'Fenêtre  2 Sud - Fenêtres battantes bois, orientées Sud, simple vitrage avec volets battants bois',
          enum_type_adjacence_id: '1',
          surface_totale_baie: 4,
          nb_baie: 2,
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
          enum_type_pose_id: '2',
          enum_orientation_id: '1',
          tv_coef_masque_proche_id: 19,
          masque_lointain_non_homogene_collection: '',
          reference: 'baie_vitree_1',
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
        },
        donnee_utilisateur: {
          enum_type_adjacence_id: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22'
          ],
          enum_type_vitrage_id: ['1', '2', '3', '4', '5', '6'],
          enum_type_baie_id: ['1', '2', '3', '4', '5', '6', '7', '8'],
          enum_type_materiaux_menuiserie_id: ['1', '2', '3', '4', '5', '6', '7'],
          vitrage_vir: 'bool',
          enum_type_pose_id: ['1', '2', '3', '4'],
          enum_type_fermeture_id: ['1', '2', '3', '4', '5', '6', '7', '8'],
          presence_retour_isolation: 'bool',
          largeur_dormant: 'float'
        }
      }
    ];

    expect(calc_as(ilpa, ca, zc, bv)).toStrictEqual({
      apport_solaire_ch: 1551436.4819200002,
      apport_solaire_fr: 97009.81888
    });
  });

  /**
   * @see : Methode_de_calcul_3CL_DPE_2021-338.pdf Page 43
   */
  test('calcul de f apport interne', () => {
    const ilpa = '0';
    const ca = '400-800m';
    const zc = 'h1c';
    const Sh = '42.5';
    const nadeq = '1.234375';

    expect(calc_ai(ilpa, ca, zc, Sh, nadeq)).toStrictEqual({
      apport_interne_ch: 1459229.75,
      apport_interne_fr: 8589.5569375
    });
  });
});
