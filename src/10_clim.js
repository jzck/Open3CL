import { requestInputID, tv } from './utils.js';

function tv_seer(di, de, du, zc_id) {
  const matcher = {
    enum_zone_climatique_id: zc_id,
    enum_periode_installation_fr_id: requestInputID(de, du, 'periode_installation_fr')
  };
  const row = tv('seer', matcher, de);
  if (row) {
    de.tv_seer_id = Number(row.tv_seer_id);
    di.eer = row.eer;
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour seer !!');
  }
}

export default function calc_clim(clim, bfr, bfr_dep, zc_id, Sh) {
  const de = clim.donnee_entree;
  const di = {};
  const du = {};

  const rs = de.surface_clim / Sh;
  di.besoin_fr = bfr * rs;
  di.besoin_fr_depensier = bfr_dep * rs;

  /**
   * Si la méthode de saisie n'est pas "Valeur forfaitaire" mais "caractéristiques saisies"
   * Documentation 3CL : "Pour les installations récentes ou recommandées, les caractéristiques réelles des chaudières présentées sur les bases
   * de données professionnelles peuvent être utilisées."
   *
   * 6 - caractéristiques saisies à partir de la plaque signalétique ou d'une documentation technique du système thermodynamique : scop/cop/eer
   * 7 - déterminé à partir du rset/rsee( etude rt2012/re2020)
   * 8 - seer saisi pour permettre la saisie de réseau de froid ou de système de climatisations qui ne sont pas éléctriques
   */
  const methodeSaisie = parseInt(de.enum_methode_saisie_carac_sys_id);
  if (![6, 7, 8].includes(methodeSaisie) || !di.eer) {
    tv_seer(di, de, du, zc_id);
  }

  di.conso_fr = (0.9 * di.besoin_fr) / di.eer;
  di.conso_fr_depensier = (0.9 * di.besoin_fr_depensier) / di.eer;

  clim.donnee_intermediaire = di;
  clim.donnee_utilisateur = du;
}
