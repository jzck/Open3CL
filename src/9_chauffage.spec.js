import calc_chauffage from './9_chauffage.js';

describe('Recherche de bugs dans le calcul de la consommation', () => {
  test('calcul de la consommation de chauffage pour 2475E2510509B', () => {
    const Sh = 22.76; // Surface habitable
    const zc_id = 1; // Zone climatique
    const ca_id = 1; // Classe d'altitude
    const inertie_id = 4; // Inertie du batiment
    const map_id = 2; // Méthode d'application du DPE (enum_methode_application_dpe_log_id)
    const bch = 7998.446638037776; // Besoin en chauffage
    const bch_dep = 9714.925476692655; // Besoin en chauffage dépensier
    const GV = 150.18558182166174; // Déperdition de l'enveloppe
    const hsp = 2.5700000000000003; // Hauteur sous plafond
    const ac = 1; // Période de construction

    const ch = {
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
            }
          }
        ]
      }
    };

    calc_chauffage(ch, ca_id, zc_id, inertie_id, map_id, bch, bch_dep, GV, Sh, hsp, ac);

    expect(ch.donnee_intermediaire).toStrictEqual({
      besoin_ch: 7998.446638037776,
      besoin_ch_depensier: 9714.925476692655,
      conso_ch: 6322.706769289927,
      conso_ch_depensier: 7679.569278179351
    });
    expect(
      ch.emetteur_chauffage_collection.emetteur_chauffage[0].donnee_intermediaire
    ).toStrictEqual({
      i0: 0.86,
      rendement_distribution: 1,
      rendement_emission: 0.95,
      rendement_regulation: 0.99
    });
    expect(
      ch.generateur_chauffage_collection.generateur_chauffage[0].donnee_intermediaire
    ).toStrictEqual({
      conso_auxiliaire_generation_ch: 0,
      conso_auxiliaire_generation_ch_depensier: 0,
      conso_ch: 6322.706769289927,
      conso_ch_depensier: 7679.569278179351,
      rendement_generation: 1,
      rg: 1,
      rg_dep: 1
    });
  });
});
