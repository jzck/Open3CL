import { requestInput } from './utils.js'
import { calc_emetteur_ch } from './9_emetteur_ch.js'
import { calc_generateur_ch } from './9_generateur_ch.js'

export default function calc_chauffage (
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
  const de = ch.donnee_entree
  const di = {}
  const du = {}

  di.besoin_ch = (bch * de.surface_chauffee) / Sh
  di.besoin_ch_depensier = (bch_dep * de.surface_chauffee) / Sh

  const em_ch = ch.emetteur_chauffage_collection.emetteur_chauffage
  em_ch.forEach((em_ch) => calc_emetteur_ch(em_ch, de, map_id, inertie_id))

  const cfg_id = requestInput(de, du, 'cfg_installation_ch')
  const Sc = de.surface_chauffee
  const gen_ch = ch.generateur_chauffage_collection.generateur_chauffage
  gen_ch.forEach((gen_ch, _pos) =>
    calc_generateur_ch(gen_ch, _pos, em_ch, cfg_id, bch, bch_dep, GV, Sh, Sc, hsp, ca_id, zc_id, ac)
  )

  di.conso_ch = gen_ch.reduce((acc, gen_ch) => acc + gen_ch.donnee_intermediaire.conso_ch, 0)
  di.conso_ch_depensier = gen_ch.reduce(
    (acc, gen_ch) => acc + gen_ch.donnee_intermediaire.conso_ch_depensier,
    0
  )

  ch.donnee_intermediaire = di
  ch.donnee_utilisateur = du
}
