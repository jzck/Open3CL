import { tv, requestInput, requestInputID } from './utils.js'

function tv_seer (di, de, du, zc_id) {
  const matcher = {
    enum_zone_climatique_id: zc_id,
    enum_periode_installation_fr_id: requestInputID(de, du, 'periode_installation_fr')
  }
  const row = tv('seer', matcher)
  if (row) {
    de.tv_seer_id = Number(row.tv_seer_id)
    di.eer = row.eer
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour seer !!')
  }
}

export default function calc_clim (clim, bfr, bfr_dep, zc_id, Sh) {
  const de = clim.donnee_entree
  const di = {}
  const du = {}

  const rs = de.surface_clim / Sh
  di.besoin_fr = bfr * rs
  di.besoin_fr_depensier = bfr_dep * rs

  tv_seer(di, de, du, zc_id)

  di.conso_fr = (0.9 * di.besoin_fr) / di.eer
  di.conso_fr_depensier = (0.9 * di.besoin_fr_depensier) / di.eer

  clim.donnee_intermediaire = di
  clim.donnee_utilisateur = du
}
