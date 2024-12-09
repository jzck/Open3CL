import enums from './enums.js';
import tvs from './tv.js';
import { mois_liste, Tbase } from './utils.js';

const G_CHAUDIERE = 20;
const G_RADIATEURS_GAZ = 40;
const G_CHAUDIERE_BOIS = 73.3;
const H_CHAUDIERE = 1.6;
const H_GENERATEUR_AIR_CHAUD = 4;
const H_CHAUDIERE_BOIS = 10.5;

/**
 * 15.1 Consommation des auxiliaires de génération
 * @param di {Donnee_intermediaire}
 * @param de {Donnee_entree}
 * @param type {'ecs'|'ch'}
 * @param besoin {number} Besoin en chauffage ou ecs pour ce générateur
 * @param besoin_dep {number} Besoin en chauffage ou ecs pour ce générateur (mode dépensier)
 * @param Sh {number} Surface habitable du logement
 */
export function conso_aux_gen(di, de, type, besoin, besoin_dep, Sh) {
  const typeGenerateur = parseInt(de[`enum_type_generateur_${type}_id`]);

  const presenceVentilateur = de.presenceVentilateur || 0;

  const g = getG(type, typeGenerateur, presenceVentilateur === 1);
  const h = getH(type, typeGenerateur, presenceVentilateur === 1);

  let pe = di.pn / (de.ratio_virtualisation || 1);

  // Pour les chaudières gaz ou fioul : si Pn > 400 kW alors Pn = 400 kW
  if (g === G_CHAUDIERE && pe > 400000) {
    pe = 400000;
  }
  // Pour les générateurs d’air chaud : si Pn > 300 kW alors Pn = 300 kW
  if (h === H_GENERATEUR_AIR_CHAUD && pe > 300000) {
    pe = 300000;
  }
  // Pour les chaudières bois : si Pn > 70 kW alors Pn = 70 kW
  if (g === G_CHAUDIERE_BOIS && pe > 70000) {
    pe = 70000;
  }

  const Paux_g_ch = g + (h * (pe / 1000)) / (de.ratio_virtualisation || 1);

  let ratio = 1;

  // Pour le chauffage, le besoin de chauffage est proratisé à la surface chauffée
  if (type === 'ch') {
    const Sc = de.surface_chauffee || Sh;
    ratio = Sc / Sh;
  }

  di[`conso_auxiliaire_generation_${type}`] =
    ((de.ratio_virtualisation || 1) * (Paux_g_ch * besoin * ratio)) / pe || 0;
  di[`conso_auxiliaire_generation_${type}_depensier`] =
    (Paux_g_ch * besoin_dep * ratio) / di.pn || 0;
}

/**
 * Récupération du facteur G en fonction du type de générateur
 * @param type {'ecs'|'ch'}
 * @param id {number}
 * @param presenceVentilateur {boolean} - Seules les chaudières bois assistées par ventilateur sont concernées
 */
function getG(type, id, presenceVentilateur) {
  const values = {
    ch: [
      { min: 85, max: 97, value: G_CHAUDIERE }, // Chaudières à gaz
      { min: 148, max: 149, value: G_CHAUDIERE }, // PAC hybride : partie chaudière gaz
      { min: 127, max: 139, value: G_CHAUDIERE }, // Chaudière gpl/propane/butane
      { min: 160, max: 161, value: G_CHAUDIERE }, // PAC hybride : partie chaudière gpl/propane/butane
      { min: 75, max: 84, value: G_CHAUDIERE }, // Chaudières fioul
      { min: 150, max: 151, value: G_CHAUDIERE }, // PAC hybride : partie chaudière fioul
      { min: 53, max: 54, value: G_RADIATEURS_GAZ }, // Radiateur à gaz
      { min: 55, max: 74, value: G_CHAUDIERE_BOIS, withVentilateur: true }, // Chaudières bois assistées par ventilateur
      { min: 152, max: 156, value: G_CHAUDIERE_BOIS, withVentilateur: true } // PAC hybride : partie chaudière bois
    ],
    ecs: [
      { min: 45, max: 57, value: G_CHAUDIERE }, // Chaudières à gaz
      { min: 120, max: 121, value: G_CHAUDIERE }, // PAC hybride : partie chaudière gaz
      { min: 92, max: 104, value: G_CHAUDIERE }, // Chaudière gpl/propane/butane
      { min: 132, max: 133, value: G_CHAUDIERE }, // PAC hybride : partie chaudière gpl/propane/butane
      { min: 35, max: 44, value: G_CHAUDIERE }, // Chaudières fioul
      { min: 122, max: 123, value: G_CHAUDIERE }, // PAC hybride : partie chaudière fioul
      { min: 13, max: 34, value: G_CHAUDIERE_BOIS, withVentilateur: true }, // Chaudières bois assistées par ventilateur
      { min: 122, max: 123, value: G_CHAUDIERE_BOIS, withVentilateur: true } // PAC hybride : partie chaudière bois
    ]
  };

  return getFacteur(values, type, id, presenceVentilateur);
}

/**
 * Récupération du facteur H en fonction du type de générateur
 * @param type {'ecs'|'ch'}
 * @param id {number}
 * @param presenceVentilateur {boolean} - Seules les chaudières bois assistées par ventilateur sont concernées
 */
function getH(type, id, presenceVentilateur) {
  const values = {
    ch: [
      { min: 85, max: 97, value: H_CHAUDIERE }, // Chaudières à gaz
      { min: 148, max: 149, value: H_CHAUDIERE }, // PAC hybride : partie chaudière gaz
      { min: 127, max: 139, value: H_CHAUDIERE }, // Chaudière gpl/propane/butane
      { min: 160, max: 161, value: H_CHAUDIERE }, // PAC hybride : partie chaudière gpl/propane/butane
      { min: 75, max: 84, value: H_CHAUDIERE }, // Chaudières fioul
      { min: 150, max: 151, value: H_CHAUDIERE }, // PAC hybride : partie chaudière fioul
      { min: 50, max: 52, value: H_GENERATEUR_AIR_CHAUD }, // Générateurs à air chaud
      { min: 55, max: 74, value: H_CHAUDIERE_BOIS, withVentilateur: true }, // Chaudières bois assistées par ventilateur
      { min: 152, max: 156, value: H_CHAUDIERE_BOIS, withVentilateur: true } // PAC hybride : partie chaudière bois
    ],
    ecs: [
      { min: 45, max: 57, value: H_CHAUDIERE }, // Chaudières à gaz
      { min: 120, max: 121, value: H_CHAUDIERE }, // PAC hybride : partie chaudière gaz
      { min: 92, max: 104, value: H_CHAUDIERE }, // Chaudière gpl/propane/butane
      { min: 132, max: 133, value: H_CHAUDIERE }, // PAC hybride : partie chaudière gpl/propane/butane
      { min: 35, max: 44, value: H_CHAUDIERE }, // Chaudières fioul
      { min: 122, max: 123, value: H_CHAUDIERE }, // PAC hybride : partie chaudière fioul
      { min: 13, max: 34, value: H_CHAUDIERE_BOIS, withVentilateur: true }, // Chaudières bois assistées par ventilateur
      { min: 122, max: 123, value: H_CHAUDIERE_BOIS, withVentilateur: true } // PAC hybride : partie chaudière bois
    ]
  };

  return getFacteur(values, type, id, presenceVentilateur);
}

function getFacteur(values, type, id, presenceVentilateur) {
  const ranges = values[type] || [];
  for (const range of ranges) {
    if (id >= range.min && id <= range.max) {
      if (!range.withVentilateur || presenceVentilateur) {
        return range.value;
      }
    }
  }

  return 0;
}

/**
 * Calcul de la consommation des auxiliaires de distribution de chauffage
 * @param em_ch { EmetteurChauffageItem[]}
 * @param de {Donnee_entree} donnée du générateur de chauffage
 * @param di {Donnee_intermediaire} donnée intermédiaire du générateur de chauffage
 * @param du {object} donnée utilisateur du générateur de chauffage
 * @param surfaceHabitable {number}
 * @param zcId {number} id de la zone climatique du bien
 * @param caId {number} id de la classe d'altitude du bien
 * @param ilpa {number} 1 si bien à inertie lourde, 0 sinon
 * @param GV {number} déperdition de l'enveloppe
 */
export function conso_aux_distribution_ch(
  em_ch,
  de,
  di,
  du,
  surfaceHabitable,
  zcId,
  caId,
  ilpa,
  GV
) {
  const ca = enums.classe_altitude[caId];
  const zc = enums.zone_climatique[zcId];

  const Nref19 = tvs.nref19[ilpa];

  let nref19 = 0;

  for (const mois of mois_liste) {
    nref19 += Nref19[ca][mois][zc];
  }

  const Pcircem19 = getPuissanceCirculateur(
    em_ch,
    de,
    di,
    du,
    surfaceHabitable,
    GV,
    Tbase[ca][zc.slice(0, 2)]
  );

  di[`conso_auxiliaire_distribution_ch`] = (Pcircem19 * nref19) / 1000;
}

/**
 * 15.2.1 Puissance des circulateurs de chauffage
 * @param em_ch { EmetteurChauffageItem[]}
 * @param de {Donnee_entree} donnée du générateur de chauffage
 * @param di {Donnee_intermediaire} donnée intermédiaire du générateur de chauffage
 * @param du {object} donnée utilisateur du générateur de chauffage
 * @param surfaceHabitable {number}
 * @param GV {number} déperdition de l'enveloppe
 * @param Tbase {number} température
 */
function getPuissanceCirculateur(em_ch, de, di, du, surfaceHabitable, GV, Tbase) {
  const typeEmetteur = parseInt(em_ch[0].donnee_entree.enum_type_emission_distribution_id);
  const temperatureEmetteur = parseInt(em_ch[0].donnee_entree.enum_temp_distribution_ch_id);

  // Perte de charge de l’émetteur
  let deltaPem = 35;
  let Fcot = 0.802;

  /**
   * 15.2.1 Puissance des circulateurs de chauffage
   * Plancher/plafond chauffant => deltaPemnom = 15
   * Radiateurs monotube => deltaPemnom = 30
   * Radiateurs autres => deltaPemnom = 10
   */
  if ([6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 43, 44].includes(typeEmetteur)) {
    deltaPem = 15;
    Fcot = 0.156;
  } else if ([24, 25, 26, 27, 28, 29, 30, 31].includes(typeEmetteur)) {
    deltaPem = 30;
  } else if ([10, 19, 32, 33, 34, 35, 36, 37, 38, 39, 45].includes(typeEmetteur)) {
    deltaPem = 10;
  }

  /**
   * En présence de plusieurs types d’émetteurs, le coefficient Fcot le plus défavorable sera pris, c’est-à-dire pour
   * l’émetteur « Autre ».
   */
  if (em_ch.length > 1) {
    Fcot = 0.802;
  }

  const nbNiveauChauffage = de.nombre_niveau_installation_ch || 1;

  // Calcul de la longueur du réseau le plus défavorisé
  const Lem = 5 * Fcot * (nbNiveauChauffage + (surfaceHabitable / nbNiveauChauffage) ** 0.5);

  // Pertes de charge du réseau (kPa)
  const deltaPemnom = 0.15 * Lem + deltaPem;

  // Ratio du besoin couvert par l’équipement
  const nbGenerateurCascade = du.nbGenerateurCascade || 1;
  const ratioSurfaceChauffage =
    (de.surface_chauffee || surfaceHabitable) / (surfaceHabitable * nbGenerateurCascade);

  // Chute nominale de température de dimensionnement
  // 4 - température de distribution de chauffage haute
  const deltaDim = temperatureEmetteur === 4 ? 15 : 7.5;

  // Puissance nominale en chaud (kW)
  const Pnc = 10 ** -3 * GV * (20 - Tbase);

  const Qvemnom = (Pnc * ratioSurfaceChauffage) / (1.163 * deltaDim);

  return Math.max(
    30,
    6.44 *
      ((deltaPemnom * Qvemnom) / Math.max(1, surfaceHabitable / 400)) ** 0.676 *
      Math.max(1, surfaceHabitable / 400)
  );
}
