import { requestInputID, tv } from './utils.js';

/**
 * Calcul ou récupération des paramètres scop ou cop
 * @param di {Donnee_intermediaire}
 * @param de {Donnee_entree}
 * @param du {Object}
 * @param zc_id {string}
 * @param ed_id {string|null}
 * @param type {'ecs'|'ch'}
 */
export function scopOrCop(di, de, du, zc_id, ed_id, type) {
  /**
   * Si la méthode de saisie n'est pas "Valeur forfaitaire" mais "caractéristiques saisies"
   * Documentation 3CL : "Pour les installations récentes ou recommandées, les caractéristiques réelles présentées sur les bases
   * de données professionnelles peuvent être utilisées."
   *
   * 6 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système thermodynamique : scop/cop/eer
   */
  if (de.enum_methode_saisie_carac_sys_id === '6') {
    di.rg = di.scop || di.cop;
    di.rg_dep = di.scop || di.cop;
  } else {
    tv_scop(di, de, du, zc_id, ed_id, type);
  }
}

function tv_scop(di, de, du, zc_id, ed_id, type) {
  const matcher = {
    enum_zone_climatique_id: zc_id
  };
  matcher[`enum_type_generateur_${type}_id`] = requestInputID(de, du, `type_generateur_${type}`);
  if (ed_id) matcher.enum_type_emission_distribution_id = ed_id;
  const row = tv('scop', matcher, de);
  if (row) {
    de.tv_scop_id = Number(row.tv_scop_id);
    const scop = row.scop_ou_cop;
    di[scop] = Number(row.scop);

    // for Ich
    di.rg = di[scop];
    di.rg_dep = di[scop];
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour scop !!');
  }
}
