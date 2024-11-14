import { requestInput, tv, tvColumnIDs } from './utils.js';
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
  const de = ch.donnee_entree;
  const di = {};
  const du = {};

  di.besoin_ch = bch;
  di.besoin_ch_depensier = bch_dep;

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

  const Fch = tv_ch_facteur_couverture_solaire(de, zc_id);

  gen_ch.forEach((gen, _pos) => {
    const prorataGenerateur =
      nbCascadeAndCombustion > 1 ? gen.donnee_intermediaire.pn / Pnominal : 1;

    gen.donnee_entree.ratio_virtualisation = de.ratio_virtualisation || 1;
    gen.donnee_entree.fch = Fch || 0.5;

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
