import enums from './enums.js'
import { tv, tvColumnIDs, requestInput, requestInputID, Tbase } from './utils.js'
import { tv_scop } from './12.4_pac.js'
import { conso_aux_gen } from './15_conso_aux.js'
import { conso_ch } from './9_conso_ch.js'
import { calc_generateur_combustion_ch } from './13.2_generateur_combustion_ch.js'

function pertes_gen_ch(Bch_hp_j, pn) {
  let pertes = (1.3 * Bch_hp_j) / (0.3 * pn)
  return pertes
}

function pertes_gen_ecs(nrefj) {
  let pertes = (nrefj * 1790) / 8760
  return pertes
}

export function calc_Qrec_gen_j(gen_ch, nrefj, Bch_hp_j) {
  let de = gen_ch.donnee_entree
  let du = gen_ch.donnee_utilisateur || {}
  let di = gen_ch.donnee_intermediaire

  if (de.position_volume_chauffe === 0) return 0

  let type_gen_ch = enums.type_generateur_ch[de.enum_type_generateur_ch_id]
  if (type_gen_ch.includes('générateur à air chaud')) return 0

  let Cper
  if (de.presence_ventouse === 1) Cper = 0.75
  else Cper = 0.5

  let usage_generateur = requestInput(de, du, 'usage_generateur')

  let Dperj
  if (usage_generateur === 'chauffage') Dperj = Math.min(nrefj, pertes_gen_ch(Bch_hp_j, di.pn))
  else if (usage_generateur === 'ecs') Dperj = pertes_gen_ecs(nrefj)
  else if (usage_generateur === 'chauffage + ecs')
    Dperj = Math.min(nrefj, pertes_gen_ch(Bch_hp_j, di.pn) + pertes_gen_ecs(nrefj))

  gen_ch.donnee_utilisateur = du
  let Qrec_gen_j = 0.48 * Cper * di.qp0 * Dperj || 0
  return Qrec_gen_j
}

function tv_rendement_generation(di, de, du) {
  let matcher = {
    enum_type_generateur_ch_id: requestInputID(de, du, 'type_generateur_ch')
  }
  const row = tv('rendement_generation', matcher, de)
  if (row) {
    di.rendement_generation = Number(row.rg)
    di.rg = di.rendement_generation
    di.rg_dep = di.rendement_generation
    de.tv_rendement_generation_id = Number(row.tv_rendement_generation_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour rendement_generation ch !!')
  }
}

function type_generateur_ch(di, de, du, usage_generateur) {
  let type_generateur
  if (usage_generateur === 'chauffage') {
    type_generateur = requestInputID(de, du, 'type_generateur_ch')
  } else if (usage_generateur === 'chauffage + ecs') {
    let generateur_ecs = enums.type_generateur_ecs
    let generateur_ch = enums.type_generateur_ch
    let generateurs_ch_ecs = Object.keys(generateur_ch).reduce((acc, key) => {
      let gen_ch = generateur_ch[key]
      if (Object.values(generateur_ecs).includes(gen_ch)) acc[key] = gen_ch
      return acc
    }, {})
    type_generateur = requestInputID(de, du, 'type_generateur_ch', Object.keys(generateurs_ch_ecs))
  } else {
    console.warn("!! usage_generateur n'est pas 'chauffage' ou 'chauffage + ecs' !!")
  }
  return type_generateur
}

export function calc_generateur_ch(
  gen_ch,
  _pos,
  em_ch,
  cfg_ch,
  bch,
  bch_dep,
  GV,
  Sh,
  Sc,
  hsp,
  ca_id,
  zc_id,
  ac
) {
  let de = gen_ch.donnee_entree
  let di = gen_ch.donnee_intermediaire || {}
  let du = gen_ch.donnee_utilisateur || {}

  let usage_generateur = requestInput(de, du, 'usage_generateur')
  let type_gen_ch_id = type_generateur_ch(di, de, du, usage_generateur)

  let pac_ids = tvColumnIDs('scop', 'generateur_ch')
  let combustion_ids = tvColumnIDs('generateur_combustion', 'type_generateur_ch')
  if (pac_ids.includes(type_gen_ch_id)) {
    let gen_lge_id = requestInputID(de, du, 'lien_generateur_emetteur')
    let em = em_ch.find((em) => em.donnee_entree.enum_lien_generateur_emetteur_id === gen_lge_id)
    let ed_id = em.donnee_entree.enum_type_emission_distribution_id
    tv_scop(di, de, du, zc_id, ed_id, 'ch')
  } else if (combustion_ids.includes(type_gen_ch_id)) {
    calc_generateur_combustion_ch(di, de, du, em_ch, GV, ca_id, zc_id, ac)
  } else {
    tv_rendement_generation(di, de, du)
  }

  conso_aux_gen(di, de, 'ch', bch, bch_dep)
  conso_ch(di, de, du, _pos, cfg_ch, em_ch, GV, Sh, hsp, bch, bch_dep)

  gen_ch.donnee_intermediaire = di
  gen_ch.donnee_utilisateur = du
}
