import calc_conso from './conso.js';

describe('Recherche de bugs dans le calcul de la consommation', () => {
  test('calcul de la consommation de chauffage pour 2475E2510509B', () => {
    const Sh = 22.76; // Surface habitable
    const zc_id = 1; // Zone climatique
    const ca_id = 1; // Classe d'altitude
    const vt = [];
    const ch = [
      {
        donnee_entree: {
          description:
            'Convecteur électrique NFC, NF** et NF*** avec programmateur pièce par pièce (système individuel)',
          reference: '2024_07_11_09_30_44_722898200737262',
          surface_chauffee: 22.76,
          rdim: 1,
          nombre_niveau_installation_ch: 1,
          enum_cfg_installation_ch_id: '1',
          enum_type_installation_id: '1',
          enum_methode_calcul_conso_id: '1'
        },
        emetteur_chauffage_collection: {
          emetteur_chauffage: [
            {
              donnee_entree: {
                description: '',
                reference: 'Emetteur:2024_07_11_09_30_44_722898200737262#1',
                surface_chauffee: 22.76,
                tv_rendement_emission_id: 1,
                tv_rendement_distribution_ch_id: 1,
                tv_rendement_regulation_id: 1,
                enum_type_emission_distribution_id: '1',
                tv_intermittence_id: 138,
                reseau_distribution_isole: 0,
                enum_equipement_intermittence_id: '4',
                enum_type_regulation_id: '2',
                enum_periode_installation_emetteur_id: '1',
                enum_type_chauffage_id: '1',
                enum_temp_distribution_ch_id: '1',
                enum_lien_generateur_emetteur_id: '1'
              },
              donnee_intermediaire: {
                rendement_distribution: 1,
                rendement_emission: 0.95,
                rendement_regulation: 0.99,
                i0: 0.86
              }
            }
          ]
        },
        generateur_chauffage_collection: {
          generateur_chauffage: [
            {
              donnee_entree: {
                description: 'Electrique - Convecteur électrique NFC, NF** et NF***',
                reference: 'Generateur:2024_07_11_09_30_44_722898200737262#1',
                reference_generateur_mixte: '',
                ref_produit_generateur_ch: 'Sans Objet',
                enum_type_generateur_ch_id: '98',
                enum_usage_generateur_id: '1',
                enum_type_energie_id: '1',
                position_volume_chauffe: 1,
                tv_rendement_generation_id: 29,
                identifiant_reseau_chaleur: '',
                enum_methode_saisie_carac_sys_id: '1',
                enum_lien_generateur_emetteur_id: '1'
              },
              donnee_intermediaire: {
                rendement_generation: 1,
                conso_ch: 6322.706407855126,
                conso_ch_depensier: 7679.56883918009,
                rg: 1,
                rg_dep: 1,
                conso_auxiliaire_generation_ch: 0,
                conso_auxiliaire_generation_ch_depensier: 0
              }
            }
          ]
        }
      }
    ];
    const ecs = [];
    const fr = [];

    const result = calc_conso(Sh, zc_id, ca_id, vt, ch, ecs, fr);

    expect(result.ef_conso.conso_ch).toBe(6322.706407855126);
    expect(result.ef_conso.conso_ch_depensier).toBe(7679.56883918009);
  });
});
