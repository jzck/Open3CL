import { requestInput, Tbase, tv, tvColumnIDs } from './utils.js';
import { calc_emetteur_ch } from './9_emetteur_ch.js';
import {
  calc_generateur_ch,
  checkForGeneratorType,
  hasConsoForAuxDistribution
} from './9_generateur_ch.js';
import { tv_generateur_combustion } from './13.2_generateur_combustion.js';
import { tv_temp_fonc_30_100 } from './13.2_generateur_combustion_ch.js';
import enums from './enums.js';

export default function calc_chauffage(
  dpe,
  ch,
  ca_id,
  zc_id,
  inertie_id,
  map_id,
  bch,
  bch_dep,
  GV,
  Sh,
  hsp,
  ac,
  ilpa
) {
  const de = ch.donnee_entree;
  const di = {};
  const du = {};

  const ca = enums.classe_altitude[ca_id];
  const zc = enums.zone_climatique[zc_id];
  const tbase = Tbase[ca][zc.slice(0, 2)];

  di.besoin_ch = bch;
  di.besoin_ch_depensier = bch_dep;

  const em_ch = ch.emetteur_chauffage_collection.emetteur_chauffage;
  em_ch.forEach((em_ch) => {
    calc_emetteur_ch(em_ch, de, map_id, inertie_id);
  });

  const Fch = tv_ch_facteur_couverture_solaire(de, zc_id);
  const cfg_id = requestInput(de, du, 'cfg_installation_ch');
  const gen_ch = ch.generateur_chauffage_collection.generateur_chauffage;

  gen_ch.forEach((gen) => {
    const genChDe = gen.donnee_entree;
    const genChDu = gen.donnee_utilisateur || {};
    const genChDi = gen.donnee_intermediaire || {};

    genChDe.ratio_virtualisation = de.ratio_virtualisation || 1;
    genChDe.surface_chauffee = de.surface_chauffee || Sh;
    genChDe.nombre_niveau_installation_ch = de.nombre_niveau_installation_ch || 1;
    genChDe.fch = Fch || 0.5;

    // Récupération du type de générateur
    checkForGeneratorType(dpe, genChDe, genChDi, genChDu);

    if (genChDu.isCombustionGenerator) {
      const methodeSaisie = parseInt(genChDe.enum_methode_saisie_carac_sys_id);
      tv_generateur_combustion(dpe, genChDi, genChDe, 'ch', GV, tbase, methodeSaisie);

      const type_gen_ch_list = tvColumnIDs('temp_fonc_30', 'type_generateur_ch');
      if (type_gen_ch_list.includes(genChDe.enum_type_generateur_ch_id)) {
        /**
         * Si la méthode de saisie n'est pas "Valeur forfaitaire" mais "caractéristiques saisies"
         * Documentation 3CL : "Pour les installations récentes ou recommandées, les caractéristiques réelles des chaudières présentées sur les bases
         * de données professionnelles peuvent être utilisées."
         *
         * 5 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système à combustion : pn, rpn,rpint,qp0,temp_fonc_30,temp_fonc_100
         */
        if (methodeSaisie !== 5 || !genChDi.temp_fonc_30 || !genChDi.temp_fonc_100) {
          tv_temp_fonc_30_100(genChDi, genChDe, genChDu, em_ch, ac);
        }
      }
    }

    gen.donnee_intermediaire = genChDi;
    gen.donnee_utilisateur = genChDu;
    gen.donnee_entree = genChDe;
  });

  /**
   * 13.2.1.3 Cascade de deux générateurs à combustion
   * Une puissance relative pour chaque générateur est calculée et appliquée à la conso globale de chauffage
   * Seuls les générateurs en cascade sont concernés
   *
   * 9.1.4.3 Les pompes à chaleur hybrides
   * Cas particulier des PAC hybrides avec répartition forfaitaire du besoin
   * @type {number|number}
   */
  const Pnominal = gen_ch.reduce((acc, gen) => acc + (gen.donnee_intermediaire.pn || 0), 0);
  du.Pnominal = Pnominal;

  const nbCascadeAndCombustion = gen_ch.filter(
    (value) =>
      value.donnee_utilisateur.isCombustionGenerator &&
      Number.parseInt(de.enum_cfg_installation_ch_id) === 1
  ).length;

  // Nombre de générateurs avec une consommation des auxiliaires de distribution
  const nbGenWithAuxConsoDistribution = gen_ch.reduce((acc, gen) => {
    if (hasConsoForAuxDistribution(gen.donnee_entree.enum_type_generateur_ch_id)) {
      acc++;
    }
    return acc;
  }, 0);

  gen_ch.forEach((gen, _pos) => {
    const prorataGenerateur = getProrataGenerateur(gen, nbCascadeAndCombustion, Pnominal, zc);
    (gen.donnee_utilisateur = gen.donnee_utilisateur || {}).nbGenerateurCascade = gen_ch.length;

    calc_generateur_ch(
      dpe,
      gen,
      _pos,
      em_ch,
      cfg_id,
      bch * prorataGenerateur,
      bch_dep * prorataGenerateur,
      GV,
      Sh,
      hsp,
      ca_id,
      zc_id,
      ilpa
    );

    // Si plusieurs générateurs de chauffage, la consommation des auxiliaires est répartie sur chacun d'eux
    if (
      gen.donnee_intermediaire.conso_auxiliaire_distribution_ch &&
      nbGenWithAuxConsoDistribution > 0
    ) {
      gen.donnee_intermediaire.conso_auxiliaire_distribution_ch /= nbGenWithAuxConsoDistribution;
    }
  });

  di.conso_ch = gen_ch.reduce((acc, gen_ch) => acc + gen_ch.donnee_intermediaire.conso_ch, 0);
  di.conso_ch_depensier = gen_ch.reduce(
    (acc, gen_ch) => acc + gen_ch.donnee_intermediaire.conso_ch_depensier,
    0
  );

  ch.donnee_intermediaire = di;
  ch.donnee_utilisateur = du;
}

/**
 * 13.2.1.3 Cascade de deux générateurs à combustion
 * Une puissance relative pour chaque générateur est calculée et appliquée à la conso globale de chauffage
 * Seuls les générateurs en cascade sont concernés
 *
 * 9.1.4.3 Les pompes à chaleur hybrides
 * Cas particulier des PAC hybrides avec répartition forfaitaire du besoin
 * @type {number|number}
 */
function getProrataGenerateur(genCh, nbCascadeAndCombustion, Pnominal, zc) {
  // IDs des pompes à chaleur hybrides
  if (
    genCh.donnee_entree.enum_type_generateur_ch_id >= 145 &&
    genCh.donnee_entree.enum_type_generateur_ch_id <= 170
  ) {
    const zone = zc.slice(0, 2);
    const hybrideProrata = {
      h1: {
        pac: 0.8,
        chaudiere: 0.2
      },
      h2: {
        pac: 0.83,
        chaudiere: 0.17
      },
      h3: {
        pac: 0.88,
        chaudiere: 0.12
      }
    };

    // Partie PAC du générateur
    if (genCh.donnee_intermediaire.scop || genCh.donnee_intermediaire.cop) {
      return hybrideProrata[zone]['pac'];
    } else {
      return hybrideProrata[zone]['chaudiere'];
    }
  }

  return nbCascadeAndCombustion > 1 ? genCh.donnee_intermediaire.pn / Pnominal : 1;
}

/**
 * Retourne le facteur de couverture solaire pour les maisons avec chauffage solaire
 * @param de {Donnee_entree}
 * @param zc_id {int}
 * @returns {number|*|null}
 */
function tv_ch_facteur_couverture_solaire(de, zc_id) {
  /**
   * 18.4 Facteur de couverture solaire
   * Les facteurs de couverture solaire peuvent être saisi directement quand ils sont connus et peuvent être justifiés.
   */
  if (de.fch_saisi) {
    return de.fch_saisi;
  }

  const matcher = {
    enum_zone_climatique_id: zc_id
  };

  const row = tv('facteur_couverture_solaire', matcher);
  if (row) {
    return Number(row.facteur_couverture_solaire);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour facteur_couverture_solaire !!');
    return null;
  }
}

/**
 * 13.2.1.2 Présence d’un ou plusieurs générateurs à combustion indépendants
 * Calcul du taux de charge cdimref et cdimrefDep pour chacun des générateurs
 *
 * @param installationChauffage {InstallationChauffageItem[]}
 * @param GV {number} déperdition de l'enveloppe
 * @param zcId {string} id de la zone climatique du bien
 * @param caId {string} id de la classe d'altitude du bien
 */
export function tauxChargeForGenerator(installationChauffage, GV, caId, zcId) {
  // Récupération des installations de chauffage avec générateur à combustion
  const installChauffageWithCombustion = [];
  installationChauffage.forEach((ch) => {
    const gen_ch = ch.generateur_chauffage_collection.generateur_chauffage;

    const genCombustion = gen_ch.reduce((acc, gen) => {
      if (gen.donnee_utilisateur.isCombustionGenerator) {
        acc.push(gen);
      }

      return acc;
    }, []);

    if (genCombustion.length) {
      ch.donnee_utilisateur.genCombustion = genCombustion;
      installChauffageWithCombustion.push(ch);
    }
  });

  const ca = enums.classe_altitude[caId];
  const zc = enums.zone_climatique[zcId];
  const tbase = Tbase[ca][zc.slice(0, 2)];

  // Pour N générateurs à combustion, puissance totale de tous les générateurs
  const Pn = installChauffageWithCombustion.reduce(
    (acc, gen) => acc + gen.donnee_utilisateur.Pnominal,
    0
  );

  installChauffageWithCombustion.forEach((installCh) => {
    (installCh.donnee_utilisateur.genCombustion || []).forEach((gen) => {
      gen.donnee_utilisateur.cdimref = Pn / (GV * (19 - tbase));
      gen.donnee_utilisateur.cdimrefDep = Pn / (GV * (21 - tbase));
    });
  });
}
