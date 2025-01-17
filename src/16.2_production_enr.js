import enums from './enums.js';
import { mois_liste, tv } from './utils.js';
import tvs from './tv.js';

export class ProductionENR {
  #taplpi = {
    chauffage: 0.02,
    ecs: 0.05,
    refroidissement: 0.25,
    eclairage: 0.05,
    auxiliaire_ventilation: 0.5,
    auxiliaire_distribution: 0.05,
    autres: 0.45
  };

  /**
   * Calcul des consommations d'électricité auto-consommée par enveloppe
   * Mise à jour des conso ef en prenant en compte ces auto-consommations
   * @param productionElecEnr
   * @param Sh {string}
   */
  calculateEnr(productionElecEnr, conso, Sh, th, zc_id) {
    const productionElectricite = {
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

    if (productionElecEnr && productionElecEnr.donnee_entree.presence_production_pv === 1) {
      // Calcul de l'électricité auto-consommée pour chaque enveloppe
      this.calculateConsoElecAc(productionElectricite, productionElecEnr, conso, zc_id, th, Sh);

      // Mise à jour des consommations ef en minorant l'énergie consommée par l'énergie autoconsommée par le poste
      this.updateEfConso(productionElectricite, conso, Sh);
    }

    return {
      production_pv: productionElectricite.production_pv,
      conso_elec_ac: productionElectricite.conso_elec_ac,
      conso_elec_ac_ch: productionElectricite.conso_elec_ac_ch,
      conso_elec_ac_ecs: productionElectricite.conso_elec_ac_ecs,
      conso_elec_ac_fr: productionElectricite.conso_elec_ac_fr,
      conso_elec_ac_eclairage: productionElectricite.conso_elec_ac_eclairage,
      conso_elec_ac_auxiliaire: productionElectricite.conso_elec_ac_auxiliaire,
      conso_elec_ac_autre_usage: productionElectricite.conso_elec_ac_autre_usage
    };
  }

  /**
   * Calcul de l'électricité auto-consommée pour chaque enveloppe
   * @param productionElectricite production ENR totale du logement
   * @param productionElecEnr installation ENR
   * @param conso
   * @param zc_id
   * @param th
   * @param Sh
   */
  calculateConsoElecAc(productionElectricite, productionElecEnr, conso, zc_id, th, Sh) {
    // Production d’électricité par des capteurs photovoltaïques Ppv (en kWh/m²)
    const Ppv = this.getPpv(productionElecEnr, zc_id);

    // Consommation annuelle d’électricité pour les autres usages (kWhef/an)
    const CelecTotAu = this.getCelecAu(th, Sh);

    /**
     * Récupération des consommations électriques pour ch et ecs
     * @type {SortieParEnergieItem}
     */
    let consoElec = conso.sortie_par_energie_collection.sortie_par_energie.find(
      (sortie) => sortie.enum_type_energie_id === '1'
    );

    /**
     * Consommation totale annuelle d’électricité pour les 5 usages réglementaires et les usages mobiliers (kWhef/an)
     */
    const Celec_tot = consoElec.conso_5_usages + CelecTotAu;

    // Autoconsommation proratisée à chaque usage
    const production = this.getTapl(conso.ef_conso, consoElec, CelecTotAu, Celec_tot);

    /**
     * Coefficient de calage représentant le taux d’auto-production maximum pouvant être atteint lorsque
     * la production d’électricité renouvelable augmente
     */
    const Tapl = Object.values(production).reduce((acc, valeur) => acc + valeur, 0);

    /**
     * Taux de couverture, correspondant au ratio entre la production totale du site et la consommation
     * annuelle tous usages (%)
     */
    const Tcv = Ppv / Celec_tot;

    /**
     * Taux d’autoproduction, correspondant au rapport entre la production d’électricité autoconsommée et la
     * consommation d’énergie (tous usages) du bâtiment (%)
     */
    const Tap = 1 / (1 / Tcv + 1 / Tapl);

    // Electricité photovoltaïque autoconsommée (kWhef/an)
    const consoElecAc = Celec_tot * Tap;

    // Mise à jour des données intermédiaires pour l'installation ENR
    productionElecEnr.donnee_intermediaire = productionElecEnr.donnee_intermediaire
      ? productionElecEnr.donnee_intermediaire
      : {};
    productionElecEnr.donnee_intermediaire.conso_elec_ac = consoElecAc;
    productionElecEnr.donnee_intermediaire.taux_autoproduction = Tap;
    productionElecEnr.donnee_intermediaire.production_pv = Ppv;

    productionElectricite.conso_elec_ac = consoElecAc;
    productionElectricite.production_pv = Ppv;

    productionElectricite.conso_elec_ac_ch = (consoElecAc * production.conso_elec_ac_ch) / Tapl;
    productionElectricite.conso_elec_ac_auxiliaire_generation_ch =
      (consoElecAc * production.conso_elec_ac_auxiliaire_generation_ch) / Tapl;
    productionElectricite.conso_elec_ac_ecs = (consoElecAc * production.conso_elec_ac_ecs) / Tapl;
    productionElectricite.conso_elec_ac_auxiliaire_generation_ecs =
      (consoElecAc * production.conso_elec_ac_auxiliaire_generation_ecs) / Tapl;
    productionElectricite.conso_elec_ac_fr = (consoElecAc * production.conso_elec_ac_fr) / Tapl;
    productionElectricite.conso_elec_ac_eclairage =
      (consoElecAc * production.conso_elec_ac_eclairage) / Tapl;
    productionElectricite.conso_elec_ac_ventilation =
      (consoElecAc * production.conso_elec_ac_ventilation) / Tapl;
    productionElectricite.conso_elec_ac_auxiliaire_distribution_ecs =
      (consoElecAc * production.conso_elec_ac_auxiliaire_distribution_ecs) / Tapl;
    productionElectricite.conso_elec_ac_auxiliaire_distribution_ch =
      (consoElecAc * production.conso_elec_ac_auxiliaire_distribution_ch) / Tapl;
    productionElectricite.conso_elec_ac_autre_usage =
      CelecTotAu * production.conso_elec_ac_autre_usage;

    // Energies autoconsommée par les auxiliaires
    const consoAcAuxiliaires =
      productionElectricite.conso_elec_ac_auxiliaire_generation_ch +
      productionElectricite.conso_elec_ac_auxiliaire_generation_ecs +
      productionElectricite.conso_elec_ac_auxiliaire_distribution_ecs +
      productionElectricite.conso_elec_ac_auxiliaire_distribution_ch +
      productionElectricite.conso_elec_ac_ventilation;

    productionElectricite.conso_elec_ac_auxiliaire = consoAcAuxiliaires;
  }

  /**
   * Mise à jour des consommations ef en minorant l'énergie consommée par l'énergie autoconsommée par chaque enveloppe
   * @param productionElectricite
   * @param conso
   * @param Sh
   */
  updateEfConso(productionElectricite, conso, Sh) {
    conso.ef_conso.conso_ecs -= productionElectricite.conso_elec_ac_ecs;
    conso.ef_conso.conso_ch -= productionElectricite.conso_elec_ac_ch;
    conso.ef_conso.conso_fr -= productionElectricite.conso_elec_ac_fr;
    conso.ef_conso.conso_eclairage -= productionElectricite.conso_elec_ac_eclairage;
    conso.ef_conso.conso_totale_auxiliaire -= productionElectricite.conso_elec_ac_auxiliaire;

    conso.ef_conso.conso_5_usages -=
      productionElectricite.conso_elec_ac_ecs +
      productionElectricite.conso_elec_ac_ch +
      productionElectricite.conso_elec_ac_fr +
      productionElectricite.conso_elec_ac_eclairage +
      productionElectricite.conso_elec_ac_auxiliaire;

    conso.ef_conso.conso_5_usages_m2 = Math.floor(conso.ef_conso.conso_5_usages / Sh);
  }

  /**
   * Calcul des taux d'autoproduction consommés pour chaque enveloppe
   * @param efConso {Ef_conso}
   * @param consoElec
   * @param ccom {number}
   * @param consoElecTotale {number}
   */
  getTapl(efConso, consoElec, ccom, consoElecTotale) {
    const productionElectricite = {
      conso_elec_ac_ch: 0,
      conso_elec_ac_auxiliaire_generation_ch: 0,
      conso_elec_ac_ecs: 0,
      conso_elec_ac_auxiliaire_generation_ecs: 0,
      conso_elec_ac_fr: 0,
      conso_elec_ac_ventilation: 0,
      conso_elec_ac_eclairage: 0,
      conso_elec_ac_auxiliaire_distribution_ecs: 0,
      conso_elec_ac_auxiliaire_distribution_ch: 0,
      conso_elec_ac_autre_usage: 0
    };

    // Consommation de chauffage récupérée directement depuis les consommations par énergie "électricité"
    const chauffage = consoElec?.conso_ch;
    if (chauffage) {
      productionElectricite.conso_elec_ac_ch =
        (this.#taplpi.chauffage * chauffage) / consoElecTotale;
    }

    const auxiliaireGenerationCh = efConso.conso_auxiliaire_generation_ch;
    if (auxiliaireGenerationCh) {
      productionElectricite.conso_elec_ac_auxiliaire_generation_ch =
        (this.#taplpi.chauffage * auxiliaireGenerationCh) / consoElecTotale;
    }

    // Consommation ECS récupérée directement depuis les consommations par énergie "électricité"
    const ecs = consoElec?.conso_ecs;
    if (ecs) {
      productionElectricite.conso_elec_ac_ecs = (this.#taplpi.ecs * ecs) / consoElecTotale;
    }

    const auxiliaireGenerationEcs = efConso.conso_auxiliaire_generation_ecs;
    if (auxiliaireGenerationEcs) {
      productionElectricite.conso_elec_ac_auxiliaire_generation_ecs =
        (this.#taplpi.ecs * auxiliaireGenerationEcs) / consoElecTotale;
    }

    const refroidissement = efConso.conso_fr;
    if (refroidissement) {
      productionElectricite.conso_elec_ac_fr =
        (this.#taplpi.refroidissement * refroidissement) / consoElecTotale;
    }

    const eclairage = efConso.conso_eclairage;
    if (eclairage) {
      productionElectricite.conso_elec_ac_eclairage =
        (this.#taplpi.eclairage * eclairage) / consoElecTotale;
    }

    const auxiliaireVentilation = efConso.conso_auxiliaire_ventilation;
    if (auxiliaireVentilation) {
      productionElectricite.conso_elec_ac_ventilation =
        (this.#taplpi.auxiliaire_ventilation * auxiliaireVentilation) / consoElecTotale;
    }

    const auxiliaireDistributionEcs = efConso.conso_auxiliaire_distribution_ecs;
    if (auxiliaireDistributionEcs) {
      productionElectricite.conso_elec_ac_auxiliaire_distribution_ecs =
        (this.#taplpi.auxiliaire_distribution * auxiliaireDistributionEcs) / consoElecTotale;
    }

    const auxiliaireDistributionCh = efConso.conso_auxiliaire_distribution_ch;
    if (auxiliaireDistributionCh) {
      productionElectricite.conso_elec_ac_auxiliaire_distribution_ch =
        (this.#taplpi.auxiliaire_distribution * auxiliaireDistributionCh) / consoElecTotale;
    }

    productionElectricite.conso_elec_ac_autre_usage =
      (this.#taplpi.autres * ccom) / consoElecTotale;

    return productionElectricite;
  }

  /**
   * Consommation annuelle d’électricité pour "autres usages" (kWhef/an)
   * @param th
   * @param Sh
   * @returns {number}
   */
  getCelecAu(th, Sh) {
    /**
     * Cum : consommation annuelle d’électricité des usages mobiliers
     * Maison individuelle 29
     * Immeuble collectif 27
     */
    const Cum = th === 'maison' ? 29 : 27;

    // Consommation annuelle d’éclairage des parties communes en logement collectif
    const CcomEcl = th === 'maison' ? 0 : 1.1;

    return (CcomEcl + Cum) * Sh;
  }

  /**
   * Production d’électricité par l'ensemble des capteurs photovoltaïques Ppv (en kWh/m²)
   *
   * @param productionElecEnr
   * @param zc_id
   * @returns {number}
   */
  getPpv(productionElecEnr, zc_id) {
    const ePvValues = tvs.e_pv;
    const zc = enums.zone_climatique[zc_id];

    let panneaux_pv_collection = productionElecEnr.panneaux_pv_collection?.panneaux_pv || [];

    if (!Array.isArray(panneaux_pv_collection)) {
      panneaux_pv_collection = [panneaux_pv_collection];
    }

    return panneaux_pv_collection.reduce((acc, panneaux_pv) => {
      const row = tv('coef_orientation_pv', {
        enum_orientation_pv_id: panneaux_pv.enum_orientation_pv_id,
        enum_inclinaison_pv_id: panneaux_pv.enum_inclinaison_pv_id
      });

      if (!row) {
        return acc;
      }

      /**
       * Coefficient de pondération prenant en compte l’altération par rapport à l’orientation optimale (30° auSud)
       * des panneaux photovoltaïques
       */
      const k = row.coef_orientation_pv;

      // Surface des panneaux photovoltaïques orientés et inclinés de la même manière (m²)
      const Scapteur = 1.6 * panneaux_pv.nombre_module || panneaux_pv.surface_totale_capteurs;

      // Rendement moyen des modules
      const r = 0.17;

      // Coefficient de perte
      const C = 0.86;

      for (const mois of mois_liste) {
        // Ensoleillement en kWh/m² pour le mois
        const Epv = ePvValues[mois][zc];
        acc += k * Scapteur * r * Epv * C;
      }

      return acc;
    }, 0);
  }
}
