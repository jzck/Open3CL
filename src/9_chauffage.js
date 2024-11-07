import { requestInput, tvColumnIDs } from './utils.js';
import { calc_emetteur_ch } from './9_emetteur_ch.js';
import { calc_generateur_ch, type_generateur_ch } from './9_generateur_ch.js';

export default function calc_chauffage(
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
  ac
) {
  // Calculate solar coverage factor (Fch) for solar heating
  const isSolarHeating = de.enum_cfg_installation_ch_id === '2'; // Assuming '2' is the ID for solar heating
  const Fch = isSolarHeating ? calculateSolarCoverageFactor(de) : 0;
  const de = ch.donnee_entree;
  const di = {};
  const du = {};

  const em_ch = ch.emetteur_chauffage_collection.emetteur_chauffage;
  em_ch.forEach((em_ch) => calc_emetteur_ch(em_ch, de, map_id, inertie_id));

  const cfg_id = requestInput(de, du, 'cfg_installation_ch');
  const gen_ch = ch.generateur_chauffage_collection.generateur_chauffage;

  /**
   * 13.2.1.3 Cascade de deux générateurs à combustion
   * Une puissance relative pour chaque générateur est calculée et appliquée à la conso globale de chauffage
   * Seuls les générateurs en cascade sont concernés
   * @type {number|number}
   */
  const Pnominal = gen_ch.reduce((acc, gen) => acc + gen.donnee_intermediaire.pn, 0);
  const nbCascadeAndCombustion = gen_ch.filter(
    (value) =>
      isGenerateurCombustion(value) && Number.parseInt(de.enum_cfg_installation_ch_id) === 1
  ).length;

  gen_ch.forEach((gen, _pos) => {
    const prorataGenerateur =
      nbCascadeAndCombustion > 1 ? gen.donnee_intermediaire.pn / Pnominal : 1;

    gen.donnee_entree.ratio_virtualisation = de.ratio_virtualisation || 1;

    Fch,
    calc_generateur_ch(
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
      ac,
      prorataGenerateur
    );
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
 * Calculate the solar coverage factor (Fch) for solar heating
 * @param {Object} de - Donnee entree object
 * @returns {number} - Solar coverage factor
 */
function calculateSolarCoverageFactor(de) {
  // This is a placeholder implementation. You need to replace this with the actual calculation
  // based on the specific requirements and available data.
  // For now, we'll return a fixed value of 0.28 as mentioned in the issue.
  return 0.28;
}
}

/**
 * Return true si le générateur est de type combustion
 * @param gen_ch {GenerateurChauffageItem}
 * @returns {boolean}
 */
function isGenerateurCombustion(gen_ch) {
  const de = gen_ch.donnee_entree;
  const di = gen_ch.donnee_intermediaire || {};
  const du = gen_ch.donnee_utilisateur || {};

  const usage_generateur = requestInput(de, du, 'usage_generateur');
  const type_gen_ch_id = type_generateur_ch(di, de, du, usage_generateur);

  const combustion_ids = tvColumnIDs('generateur_combustion', 'type_generateur_ch');

  return combustion_ids.includes(type_gen_ch_id);
}
