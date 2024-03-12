import enums from './enums.js'
import b from './3.1_b.js'
import { tv, requestInput, requestInputID } from './utils.js'

function tv_ug(di, de, du) {
  let matcher = {
    enum_type_vitrage_id: requestInputID(de, du, 'type_vitrage')
  }

  if (matcher.enum_type_vitrage_id && matcher.enum_type_vitrage_id != '1') {
    // inside if because simple vitrage does not have these fields
    matcher.enum_type_gaz_lame_id = requestInputID(de, du, 'type_gaz_lame')
    matcher.enum_inclinaison_vitrage_id = requestInputID(de, du, 'inclinaison_vitrage')
    matcher.vitrage_vir = requestInput(de, du, 'vitrage_vir', 'bool')
    matcher.epaisseur_lame = requestInput(de, du, 'epaisseur_lame', 'float')
  }
  const row = tv('ug', matcher)
  if (row) {
    di.ug = Number(row.ug)
    de.tv_ug_id = Number(row.tv_ug_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour ug !!')
  }
}

function tv_uw(di, de, du) {
  let matcher = {
    enum_type_baie_id: requestInputID(de, du, 'type_baie')
  }

  if (matcher.enum_type_baie_id && !['1', '2', '3'].includes(matcher.enum_type_baie_id)) {
    matcher.enum_type_materiaux_menuiserie_id = requestInputID(de, du, 'type_materiaux_menuiserie')
    matcher.ug = `^${di.ug}$`
  }
  const row = tv('uw', matcher)
  if (row) {
    di.uw = Number(row.uw)
    de.tv_uw_id = Number(row.tv_uw_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour uw !!')
  }
}

function tv_deltar(di, de, du) {
  let matcher = {
    enum_type_fermeture_id: requestInputID(de, du, 'type_fermeture')
  }
  const row = tv('deltar', matcher)
  if (row) {
    di.deltar = Number(row.deltar)
    de.tv_deltar_id = Number(row.tv_deltar_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour deltar !!')
  }
}

function tv_ujn(di, de, du) {
  tv_deltar(di, de, du)
  let matcher = {
    deltar: di.deltar,
    uw: `^${di.uw}$`
  }
  const row = tv('ujn', matcher)
  if (row) {
    di.ujn = Number(row.ujn)
    de.tv_ujn_id = Number(row.tv_ujn_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour ujn !!')
  }
}

function tv_sw(di, de, du) {
  let matcher = {
    enum_type_vitrage_id: requestInputID(de, du, 'type_vitrage')
  }

  matcher.enum_type_baie_id = requestInputID(de, du, 'type_baie')
  matcher.enum_type_materiaux_menuiserie_id = requestInputID(de, du, 'type_materiaux_menuiserie')
  matcher.vitrage_vir = requestInput(de, du, 'vitrage_vir', 'bool')
  matcher.enum_type_pose_id = requestInputID(de, du, 'type_pose')
  /* if (!["1", "2", "3"].includes(matcher.enum_type_baie_id)) { */
  /*   // not for briques verre/polycarbonate */
  /* } */

  const row = tv('sw', matcher)
  if (row) {
    di.sw = Number(row.sw)
    de.tv_sw_id = Number(row.tv_sw_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour sw !!')
  }
}

function tv_masque_proche(di, de, du) {
  if (!de.tv_coef_masque_proche_id) return
  let matcher = {
    tv_coef_masque_proche_id: de.tv_coef_masque_proche_id // TODO remove
  }
  const row = tv('coef_masque_proche', matcher)
  if (row) {
    di.fe1 = Number(row.fe1)
    de.tv_coef_masque_proche_id = Number(row.tv_coef_masque_proche_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour coef_masque_proche !!')
  }
}

function tv_masque_lointain_homogene(di, de, du) {
  if (!de.tv_coef_masque_lointain_homogene_id) return
  let matcher = {
    tv_coef_masque_lointain_homogene_id: de.tv_coef_masque_lointain_homogene_id // TODO remove
  }
  const row = tv('coef_masque_lointain_homogene', matcher)
  if (row) {
    di.fe2 = Number(row.fe2)
    de.tv_coef_masque_lointain_homogene_id = Number(row.tv_coef_masque_lointain_homogene_id)
  } else {
    console.log('!! pas de valeur forfaitaire trouvée pour coef_masque_lointain_homogene !!')
  }
}

function calc_omb(ml) {
  let matcher = {
    tv_coef_masque_lointain_non_homogene_id: ml.tv_coef_masque_lointain_non_homogene_id // TODO remove
  }
  const row = tv('coef_masque_lointain_non_homoge', matcher)
  if (row) {
    let omb = Number(row.omb)
    /* de.tv_coef_masque_lointain_non_homogene_id = Number(row.tv_coef_masque_lointain_homogene_id) */
    return omb
  } else {
    console.log('!! pas de valeur forfaitaire trouvée pour coef_masque_lointain_non_homog !!')
  }
}

export default function calc_bv(bv, zc) {
  let de = bv.donnee_entree
  let du = {}
  let di = {}

  b(di, de, du, zc)

  if (de.sw_saisi) di.sw = de.sw_saisi
  else tv_sw(di, de, du)

  tv_ug(di, de, du)
  if (de.uw_saisi) di.uw = de.uw_saisi
  else tv_uw(di, de, du)

  let type_fermeture = requestInput(de, du, 'type_fermeture')
  if (type_fermeture != 'abscence de fermeture pour la baie vitrée') {
    tv_ujn(di, de, du)
    di.u_menuiserie = di.ujn
  } else {
    di.u_menuiserie = di.uw
  }

  di.fe2 = 1
  if (de.masque_lointain_non_homogene_collection) {
    let mlnh = de.masque_lointain_non_homogene_collection.masque_lointain_non_homogene || []
    di.fe2 = Math.max(0, mlnh.reduce((acc, ml) => acc - calc_omb(ml) / 100, 1))
  }
  tv_masque_proche(di, de, du)
  tv_masque_lointain_homogene(di, de, du)

  delete di.deltar

  bv.donnee_utilisateur = du
  bv.donnee_intermediaire = di
}
