import enums from './enums.js'
import { getKeyByValue } from './utils.js'

function qualite_isol(u, s1, s2, s3, dp) {
  if (!u) u = 0
  if (u < s1) return Number(getKeyByValue(enums.qualite_composant, 'très bonne'))
  else if (u < s2) return Number(getKeyByValue(enums.qualite_composant, 'bonne'))
  else if (u < s3) return Number(getKeyByValue(enums.qualite_composant, 'moyenne'))
  return Number(getKeyByValue(enums.qualite_composant, 'insuffisante'))
}

export default function calc_qualite_isolation(enveloppe, dp) {
  const mur_list = enveloppe.mur_collection.mur
  const pb_list = enveloppe.plancher_bas_collection.plancher_bas
  const ph_list = enveloppe.plancher_haut_collection.plancher_haut || []
  const bv_list = enveloppe.baie_vitree_collection.baie_vitree
  const porte_list = enveloppe.porte_collection.porte || []
  let plancher_haut_ca = ph_list.filter(
    (ph) =>
      ph.donnee_entree.enum_type_adjacence_id === getKeyByValue(enums.type_adjacence, 'extérieur')
  )
  let plancher_haut_cp = ph_list.filter(
    (ph) =>
      ph.donnee_entree.enum_type_adjacence_id != getKeyByValue(enums.type_adjacence, 'extérieur')
  )

  // mur
  let umur = mur_list.reduce((acc, mur) => {
    let type_adjacence = enums.type_adjacence[mur.donnee_entree.enum_type_adjacence_id]
    if (type_adjacence.includes('local non déperditif')) return acc
    else return acc + mur.donnee_entree.surface_paroi_opaque * mur.donnee_intermediaire.umur
  }, 0)
  let smur = mur_list.reduce((acc, mur) => {
    let type_adjacence = enums.type_adjacence[mur.donnee_entree.enum_type_adjacence_id]
    if (type_adjacence.includes('local non déperditif')) return acc
    else return acc + mur.donnee_entree.surface_paroi_opaque
  }, 0)

  // pb
  let upb = pb_list.reduce((acc, pb) => {
    let type_adjacence = enums.type_adjacence[pb.donnee_entree.enum_type_adjacence_id]
    if (type_adjacence.includes('local non déperditif')) return acc
    else return acc + pb.donnee_entree.surface_paroi_opaque * pb.donnee_intermediaire.upb_final
  }, 0)
  let spb = pb_list.reduce((acc, pb) => {
    let type_adjacence = enums.type_adjacence[pb.donnee_entree.enum_type_adjacence_id]
    if (type_adjacence.includes('local non déperditif')) return acc
    else return acc + pb.donnee_entree.surface_paroi_opaque
  }, 0)

  // ph
  let uph_ca = plancher_haut_ca.reduce(
    (acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque * ph.donnee_intermediaire.uph,
    0
  )
  let uph_cp = plancher_haut_cp.reduce(
    (acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque * ph.donnee_intermediaire.uph,
    0
  )
  let sph_ca = plancher_haut_ca.reduce((acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque, 0)
  let sph_cp = plancher_haut_cp.reduce((acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque, 0)

  // menuiserie
  let umen =
    bv_list.reduce(
      (acc, bv) =>
        acc + bv.donnee_entree.surface_totale_baie * bv.donnee_intermediaire.u_menuiserie,
      0
    ) +
    porte_list.reduce(
      (acc, porte) => acc + porte.donnee_entree.surface_porte * porte.donnee_intermediaire.uporte,
      0
    )
  let sporte = porte_list.reduce((acc, porte) => acc + porte.donnee_entree.surface_porte, 0)
  let sbv = bv_list.reduce((acc, bv) => acc + bv.donnee_entree.surface_totale_baie, 0)

  const dep =
    dp.deperdition_mur +
    dp.deperdition_plancher_bas +
    dp.deperdition_plancher_haut +
    dp.deperdition_baie_vitree +
    dp.deperdition_porte +
    dp.deperdition_pont_thermique
  const sdep = smur + spb + sph_ca + sph_cp + sbv + sporte
  const ubat = dep / sdep

  let ret = {
    ubat: ubat,
    qualite_isol_enveloppe: qualite_isol(ubat, 0.45, 0.65, 0.85),
    qualite_isol_mur: qualite_isol(umur / smur, 0.3, 0.45, 0.65),
    qualite_isol_plancher_bas: qualite_isol(upb / spb, 0.25, 0.45, 0.65),
    qualite_isol_menuiserie: qualite_isol(umen / (sbv + sporte), 1.6, 2.2, 3)
  }
  if (sph_ca > 0)
    ret.qualite_isol_plancher_haut_comble_amenage = qualite_isol(uph_ca / sph_ca, 0.18, 0.25, 0.3)
  if (sph_cp > 0)
    ret.qualite_isol_plancher_haut_comble_perdu = qualite_isol(uph_cp / sph_cp, 0.15, 0.2, 0.3)

  return ret
}
