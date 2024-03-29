import enums from './enums.js'
import { getKeyByValue, requestInput } from './utils.js'

function inertie_ph_lourd (de, du) {
  const methode_saisie_u = requestInput(de, du, 'methode_saisie_u')
  if (methode_saisie_u === 'non isolé') {
    const type_plancher_haut = requestInput(de, du, 'type_plancher_haut')
    if (!type_plancher_haut) return 1
    if (type_plancher_haut.includes('lourd')) return 1
  }
  return 0
}

function inertie_pb_lourd (de, du) {
  const methode_saisie_u = requestInput(de, du, 'methode_saisie_u')
  const type_plancher_bas = requestInput(de, du, 'type_plancher_bas')
  const type_adjacence = requestInput(de, du, 'type_adjacence')
  if (type_plancher_bas.includes('lourd')) return 1
  if (
    methode_saisie_u === 'non isolé' &&
    type_plancher_bas === 'dalle béton' &&
    type_adjacence === 'terre-plein'
  ) {
    return 1
  }
  return 0
}

function inertie_mur_lourd (de, du) {
  const type_isolation = requestInput(de, du, 'type_isolation')
  if (type_isolation === 'non isolé' || type_isolation === 'ite') {
    const msm = requestInput(de, du, 'materiaux_structure_mur')
    if (msm.includes('pierre') || msm.includes('pisé')) return 1
    if (msm.includes('sandwich')) return 1
  }
  return 0
}

export default function calc_inertie (enveloppe) {
  const inertie = {}

  // pb
  const pb = enveloppe.plancher_bas_collection.plancher_bas
  const s_pb_lourd = pb.reduce((acc, pb) => {
    const de = pb.donnee_entree
    const du = pb.donnee_utilisateur
    return acc + de.surface_paroi_opaque * inertie_pb_lourd(de, du)
  }, 0)
  const s_pb_total = pb.reduce((acc, pb) => acc + pb.donnee_entree.surface_paroi_opaque, 0)
  inertie.inertie_plancher_bas_lourd = s_pb_lourd / s_pb_total > 0.5 ? 1 : 0

  // ph
  const ph = enveloppe.plancher_haut_collection.plancher_haut || []
  const s_ph_lourd = ph.reduce((acc, ph) => {
    const de = ph.donnee_entree
    const du = ph.donnee_utilisateur
    return acc + de.surface_paroi_opaque * inertie_ph_lourd(de, du)
  }, 0)
  const s_ph_total = ph.reduce((acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque, 0)
  inertie.inertie_plancher_haut_lourd = s_ph_lourd / s_ph_total > 0.5 ? 1 : 0

  // mur
  const mur = enveloppe.mur_collection.mur
  const s_mur_lourd = mur.reduce((acc, mur) => {
    const de = mur.donnee_entree
    const du = mur.donnee_utilisateur
    return acc + de.surface_paroi_opaque * inertie_mur_lourd(de, du)
  }, 0)
  const s_mur_total = mur.reduce((acc, mur) => acc + mur.donnee_entree.surface_paroi_opaque, 0)
  inertie.inertie_paroi_verticale_lourd = s_mur_lourd / s_mur_total > 0.5 ? 1 : 0

  const nb_inertie_lourde =
    inertie.inertie_plancher_bas_lourd +
    inertie.inertie_plancher_haut_lourd +
    inertie.inertie_paroi_verticale_lourd

  if (nb_inertie_lourde == 0) {
    inertie.enum_classe_inertie_id = getKeyByValue(enums.classe_inertie, 'légère')
  } else if (nb_inertie_lourde == 1) {
    inertie.enum_classe_inertie_id = getKeyByValue(enums.classe_inertie, 'moyenne')
  } else if (nb_inertie_lourde == 2) {
    inertie.enum_classe_inertie_id = getKeyByValue(enums.classe_inertie, 'lourde')
  } else if (nb_inertie_lourde == 3) {
    inertie.enum_classe_inertie_id = getKeyByValue(enums.classe_inertie, 'très lourde')
  }

  return inertie
}
