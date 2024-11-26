import enums from './enums.js';
import tvs from './tv.js';
import { mois_liste, Tbase } from './utils.js';

const G = {
  'chaudière gaz': 20,
  'chaudière fioul': 20,
  'radiateur à gaz': 40
  // TODO chaudiere bois assité par ventilateur: 73.3
};

const H = {
  'chaudière gaz': 1.6,
  'chaudière fioul': 1.6,
  'générateur à air chaud': 4
  // TODO chaudiere bois assité par ventilateur: 10.5
};

export function conso_aux_gen(di, de, type, bch, bch_dep, Sh) {
  const type_generateur = enums[`type_generateur_${type}`][de[`enum_type_generateur_${type}_id`]];
  // find key in G that starts with type_generateur_ch
  const g = G[Object.keys(G).find((key) => type_generateur.startsWith(key))] || 0;
  const h = H[Object.keys(G).find((key) => type_generateur.startsWith(key))] || 0;
  const Paux_g_ch = g + h * (di.pn / 1000);

  let ratio = 1;

  // Pour le chauffage, le besoin de chauffage est proratisé à la surface chauffée
  if (type === 'ch') {
    const Sc = de.surface_chauffee || Sh;
    ratio = Sc / Sh;
  }

  di[`conso_auxiliaire_generation_${type}`] = (Paux_g_ch * bch * ratio) / di.pn || 0;
  di[`conso_auxiliaire_generation_${type}_depensier`] = (Paux_g_ch * bch_dep * ratio) / di.pn || 0;
}

/**
 * Calcul de la consommation des auxiliaires de distribution de chauffage
 * @param em_ch { EmetteurChauffageItem[]}
 * @param di {Donnee_intermediaire} donnée intermédiaire d'une installation_chauffage
 * @param surfaceHabitable {number}
 * @param zcId {number} id de la zone climatique du bien
 * @param caId {number} id de la classe d'altitude du bien
 * @param ilpa {number} 1 si bien à inertie lourde, 0 sinon
 * @param GV {number} déperdition de l'enveloppe
 */
export function conso_aux_distribution_ch(em_ch, di, surfaceHabitable, zcId, caId, ilpa, GV) {
  const ca = enums.classe_altitude[caId];
  const zc = enums.zone_climatique[zcId];

  const Nref19 = tvs.nref19[ilpa];

  let nref19 = 0;

  for (const mois of mois_liste) {
    nref19 += Nref19[ca][mois][zc];
  }

  const Pcircem19 = getPuissanceCirculateur(
    em_ch,
    di,
    surfaceHabitable,
    GV,
    Tbase[ca][zc.slice(0, 2)]
  );

  di[`conso_auxiliaire_distribution_ch`] = (Pcircem19 * nref19) / 1000;
}

/**
 * 15.2.1 Puissance des circulateurs de chauffage
 * @param em_ch { EmetteurChauffageItem[]}
 * @param di {Donnee_intermediaire} donnée intermédiaire d'une installation_chauffage
 * @param surfaceHabitable {number}
 * @param GV {number} déperdition de l'enveloppe
 * @param Tbase {number} température
 */
function getPuissanceCirculateur(em_ch, di, surfaceHabitable, GV, Tbase) {
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

  const nbNiveauChauffage = em_ch[0].donnee_entree.nombre_niveau_installation_ch || 1;

  // Calcul de la longueur du réseau le plus défavorisé
  const Lem = 5 * Fcot * (nbNiveauChauffage + (surfaceHabitable / nbNiveauChauffage) ** 0.5);

  // Pertes de charge du réseau (kPa)
  const deltaPemnom = 0.15 * Lem + deltaPem;

  // Ratio du besoin couvert par l’équipement
  const ratioSurfaceChauffage =
    (em_ch[0].donnee_entree.surface_chauffee || surfaceHabitable) / surfaceHabitable;

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
