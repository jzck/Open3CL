import { ProductionENR } from './16.2_production_enr.js';

describe('production ENR unit tests', () => {
  /**
   * @see : Methode_de_calcul_3CL_DPE_2021-338.pdf Page 103
   */
  const productionENR = new ProductionENR();

  test('should get conso elect au', () => {
    // surface * 29 pour une maison
    expect(productionENR.getCelecAu('maison', 10)).toBe(290);

    // surface * (27 + 1.1) pour un appartement
    expect(productionENR.getCelecAu('appartement', 10)).toBe(281);
  });

  test('should get ppv 0 without ENR', () => {
    let productionElecEnr = {};
    expect(productionENR.getPpv(productionElecEnr, 1)).toBe(0);

    productionElecEnr.panneaux_pv_collection = {};
    expect(productionENR.getPpv(productionElecEnr, 1)).toBe(0);

    productionElecEnr.panneaux_pv_collection = {
      panneaux_pv: []
    };
    expect(productionENR.getPpv(productionElecEnr, 1)).toBe(0);
  });

  test('should get ppv 0 with unknown coef_orientation_pv', () => {
    let productionElecEnr = {
      panneaux_pv_collection: {
        panneaux_pv: [
          {
            enum_orientation_pv_id: 12,
            enum_inclinaison_pv_id: 12
          },
          {
            enum_orientation_pv_id: 15,
            enum_inclinaison_pv_id: 12
          }
        ]
      }
    };
    expect(productionENR.getPpv(productionElecEnr, 1)).toBe(0);
  });

  it.each([
    [2826.8015616000007, 8, 9.6],
    [2120.1011712, undefined, 9.6]
  ])(
    'should get ppv %s with nombre module %s and surface totale capteur %s',
    (ppv, nombre_module, surface_totale_capteurs) => {
      let productionElecEnr = {
        panneaux_pv_collection: {
          panneaux_pv: [
            {
              surface_totale_capteurs: surface_totale_capteurs,
              nombre_module: nombre_module,
              enum_orientation_pv_id: 1,
              enum_inclinaison_pv_id: 2
            }
          ]
        }
      };
      expect(productionENR.getPpv(productionElecEnr, 1)).toBe(ppv);
    }
  );

  test('should update ef conso', () => {
    const productionElectricite = {
      conso_elec_ac_fr: 100,
      conso_elec_ac_ch: 150,
      conso_elec_ac_ecs: 200,
      conso_elec_ac_eclairage: 250,
      conso_elec_ac_auxiliaire: 300
    };

    const conso = {
      ef_conso: {
        conso_ecs: 1000,
        conso_ch: 500,
        conso_fr: 800,
        conso_eclairage: 900,
        conso_totale_auxiliaire: 1250,
        conso_5_usages: 1500,
        conso_5_usages_m2: 100
      }
    };

    productionENR.updateEfConso(productionElectricite, conso, 10);

    expect(conso).toStrictEqual({
      ef_conso: {
        conso_ecs: 800,
        conso_ch: 350,
        conso_fr: 700,
        conso_eclairage: 650,
        conso_totale_auxiliaire: 950,
        conso_5_usages: 500,
        conso_5_usages_m2: 50
      }
    });
  });

  test('should get tapl', () => {
    let productionElectricite = productionENR.getTapl({}, {}, 158, 2500);

    expect(productionElectricite).toStrictEqual({
      conso_elec_ac_ch: 0,
      conso_elec_ac_eclairage: 0,
      conso_elec_ac_ecs: 0,
      conso_elec_ac_fr: 0,
      conso_elec_ac_auxiliaire_distribution_ch: 0,
      conso_elec_ac_auxiliaire_distribution_ecs: 0,
      conso_elec_ac_auxiliaire_generation_ch: 0,
      conso_elec_ac_auxiliaire_generation_ecs: 0,
      conso_elec_ac_ventilation: 0,
      conso_elec_ac_autre_usage: 0.028440000000000003
    });

    const consoElec = {
      conso_ch: 1000,
      conso_ecs: 1500
    };

    const efConso = {
      conso_ecs: 1000,
      conso_ch: 500,
      conso_fr: 800,
      conso_eclairage: 900,
      conso_auxiliaire_distribution_ch: 250,
      conso_auxiliaire_distribution_ecs: 110,
      conso_auxiliaire_generation_ch: 100,
      conso_auxiliaire_generation_ecs: 120,
      conso_auxiliaire_ventilation: 150,
      conso_totale_auxiliaire: 1250,
      conso_5_usages: 1500,
      conso_5_usages_m2: 100
    };

    productionElectricite = productionENR.getTapl(efConso, consoElec, 158, 2500);

    expect(productionElectricite).toStrictEqual({
      conso_elec_ac_ch: 0.008,
      conso_elec_ac_eclairage: 0.018,
      conso_elec_ac_ecs: 0.03,
      conso_elec_ac_fr: 0.08,
      conso_elec_ac_auxiliaire_distribution_ch: 0.005,
      conso_elec_ac_auxiliaire_distribution_ecs: 0.0022,
      conso_elec_ac_auxiliaire_generation_ch: 0.0008,
      conso_elec_ac_auxiliaire_generation_ecs: 0.0024,
      conso_elec_ac_ventilation: 0.03,
      conso_elec_ac_autre_usage: 0.028440000000000003
    });
  });

  test('should calculate conso elec', () => {
    let productionElecEnr = {
      panneaux_pv_collection: {
        panneaux_pv: [
          {
            nombre_module: 8,
            enum_orientation_pv_id: 1,
            enum_inclinaison_pv_id: 2
          }
        ]
      }
    };

    let productionElectricite = {
      conso_elec_ac: 0,
      production_pv: 0,
      conso_elec_ac_ch: 0,
      conso_elec_ac_auxiliaire_generation_ch: 0,
      conso_elec_ac_ecs: 0,
      conso_elec_ac_auxiliaire_generation_ecs: 0,
      conso_elec_ac_fr: 0,
      conso_elec_ac_ventilation: 0,
      conso_elec_ac_eclairage: 0,
      conso_elec_ac_auxiliaire_distribution_ecs: 0,
      conso_elec_ac_auxiliaire_distribution_ch: 0,
      conso_elec_ac_auxiliaire: 0,
      conso_elec_ac_autre_usage: 0
    };

    const conso = {
      ef_conso: {
        conso_ecs: 1000,
        conso_ch: 500,
        conso_fr: 800,
        conso_eclairage: 900,
        conso_totale_auxiliaire: 1250,
        conso_5_usages: 1500,
        conso_5_usages_m2: 100
      },
      sortie_par_energie_collection: {
        sortie_par_energie: [
          {
            enum_type_energie_id: '1',
            conso_5_usages: 1500,
            conso_ch: 1000,
            conso_ecs: 1500
          }
        ]
      }
    };

    productionENR.calculateConsoElecAc(
      productionElectricite,
      productionElecEnr,
      conso,
      1,
      'maison',
      100
    );

    expect(productionElectricite).toStrictEqual({
      conso_elec_ac: 1039.8691678904038,
      production_pv: 2826.8015616000007,
      conso_elec_ac_ch: 12.64278623574959,
      conso_elec_ac_auxiliaire_generation_ch: 0,
      conso_elec_ac_ecs: 47.41044838406096,
      conso_elec_ac_auxiliaire_generation_ecs: 0,
      conso_elec_ac_fr: 126.42786235749591,
      conso_elec_ac_ventilation: 0,
      conso_elec_ac_eclairage: 28.44626903043658,
      conso_elec_ac_auxiliaire_distribution_ecs: 0,
      conso_elec_ac_auxiliaire_distribution_ch: 0,
      conso_elec_ac_auxiliaire: 0,
      conso_elec_ac_autre_usage: 860.1136363636363
    });

    expect(productionElecEnr).toStrictEqual({
      donnee_intermediaire: {
        conso_elec_ac: 1039.8691678904038,
        production_pv: 2826.8015616000007,
        taux_autoproduction: 0.2363339017932736
      },
      panneaux_pv_collection: {
        panneaux_pv: [
          {
            enum_inclinaison_pv_id: 2,
            enum_orientation_pv_id: 1,
            nombre_module: 8
          }
        ]
      }
    });
  });
});
