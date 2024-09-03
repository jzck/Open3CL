import { calc_generateur_ch } from './9_generateur_ch.js';

describe('Recherche de bugs dans le calcul de la consommation des generateurs de chauffage', () => {
  test('calcul de la consommation des generateurs de chauffage pour 2475E2510509B', () => {
    const gen_ch = {
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
    };
    const _pos = 0;
    const em_ch = [
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
        },
        donnee_utilisateur: {}
      }
    ];
    const cfg_ch = 'installation de chauffage simple';
    const bch = 8001.0714;
    const bch_dep = 9714.925476692655;
    const GV = 150.18558182166174;
    const Sh = 22.76;
    const Sc = 22.76;
    const hsp = 2.5700000000000003;
    const ca_id = 1;
    const zc_id = 1;
    const ac = 1;

    calc_generateur_ch(
      gen_ch,
      _pos,
      em_ch,
      cfg_ch,
      bch,
      bch_dep,
      GV,
      Sh,
      Sc,
      hsp,
      ca_id,
      zc_id,
      ac
    );

    expect(gen_ch.donnee_intermediaire).toStrictEqual({
      conso_auxiliaire_generation_ch: 0,
      conso_auxiliaire_generation_ch_depensier: 0,
      conso_ch: 6324.781622192915, // 7315,978 trouvé par Olivier
      conso_ch_depensier: 7679.569278179351,
      rendement_generation: 1,
      rg: 1,
      rg_dep: 1
    });
  });
});
