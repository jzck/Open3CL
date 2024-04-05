import enums from './enums.js';
import calc_mur from './3.2.1_mur.js';
import calc_pb from './3.2.2_plancher_bas.js';
import calc_ph from './3.2.3_plancher_haut.js';
import calc_bv from './3.3_baie_vitree.js';
import calc_porte from './3.3.1.4_porte.js';
import calc_pont_thermique from './3.4_pont_thermique.js';
import calc_ventilation from './4_ventilation.js';

function calc_Sdep(murs_list, porte_list, bv_list) {
  const Smurs_dep = murs_list.reduce((acc, mur) => {
    const type_adjacence = enums.type_adjacence[mur.donnee_entree.enum_type_adjacence_id];
    if (type_adjacence.includes('local non déperditif')) return acc;
    else return acc + Number(mur.donnee_entree.surface_paroi_opaque);
  }, 0);
  const Sporte = porte_list.reduce(
    (acc, porte) => acc + Number(porte.donnee_entree.surface_porte),
    0
  );
  const Sbv = bv_list.reduce((acc, bv) => acc + Number(bv.donnee_entree.surface_totale_baie), 0);
  const Sdep = Smurs_dep + Sporte + Sbv;
  return Sdep;
}

export function Umur(o) {
  const de = o.donnee_entree;
  const di = o.donnee_intermediaire;
  return de.surface_paroi_opaque * di.umur * di.b;
}

export function Uph(o) {
  const de = o.donnee_entree;
  const di = o.donnee_intermediaire;
  return de.surface_paroi_opaque * di.uph * di.b;
}

export function Upb(o) {
  const de = o.donnee_entree;
  const di = o.donnee_intermediaire;
  return de.surface_paroi_opaque * di.upb_final * di.b;
}

export function Ubv(o) {
  const de = o.donnee_entree;
  const di = o.donnee_intermediaire;
  return de.surface_totale_baie * di.u_menuiserie * di.b;
}

export function Uporte(o) {
  const de = o.donnee_entree;
  const di = o.donnee_intermediaire;
  return de.surface_porte * di.uporte * di.b;
}

export function Upt(o) {
  const de = o.donnee_entree;
  const di = o.donnee_intermediaire;
  return de.l * di.k * (de.pourcentage_valeur_pont_thermique || 1);
}

export default function calc_deperdition(cg, zc, th, ej, enveloppe, logement) {
  const pc = cg.enum_periode_construction_id;

  const mur_list = enveloppe.mur_collection.mur;
  const pb_list = enveloppe.plancher_bas_collection.plancher_bas || [];
  const ph_list = enveloppe.plancher_haut_collection.plancher_haut || [];
  const bv_list = enveloppe.baie_vitree_collection.baie_vitree;
  const porte_list = enveloppe.porte_collection.porte || [];
  const pt_list = enveloppe.pont_thermique_collection.pont_thermique || [];
  const vt_list = logement.ventilation_collection.ventilation;

  mur_list.forEach((mur) => calc_mur(mur, zc, pc, ej));
  pb_list.forEach((pb) => calc_pb(pb, zc, pc, ej, pb_list));
  ph_list.forEach((ph) => calc_ph(ph, zc, pc, ej));
  bv_list.forEach((bv) => calc_bv(bv, zc));
  porte_list.forEach((porte) => calc_porte(porte, zc));
  pt_list.forEach((pt) => calc_pont_thermique(pt, pc, enveloppe));

  const murs_list = mur_list.concat(ph_list);
  const Sdep = calc_Sdep(murs_list, porte_list, bv_list);

  vt_list.forEach((vt) => {
    calc_ventilation(vt, cg, th, Sdep, mur_list, ph_list, porte_list, bv_list);
  });

  const d_mur = mur_list.reduce((acc, mur) => acc + Umur(mur), 0);
  const d_pb = pb_list.reduce((acc, pb) => acc + Upb(pb), 0);
  const d_ph = ph_list.reduce((acc, ph) => acc + Uph(ph), 0);
  const d_bv = bv_list.reduce((acc, bv) => acc + Ubv(bv), 0);
  const d_porte = porte_list.reduce((acc, porte) => acc + Uporte(porte), 0);
  const d_pt = pt_list.reduce((acc, pt) => acc + Upt(pt), 0);
  const hvent = vt_list.reduce((acc, vt) => acc + vt.donnee_intermediaire.hvent, 0);
  const hperm = vt_list.reduce((acc, vt) => acc + vt.donnee_intermediaire.hperm, 0);

  return {
    hvent,
    hperm,
    deperdition_renouvellement_air: hvent + hperm,
    deperdition_mur: d_mur,
    deperdition_plancher_bas: d_pb,
    deperdition_plancher_haut: d_ph,
    deperdition_baie_vitree: d_bv,
    deperdition_porte: d_porte,
    deperdition_pont_thermique: d_pt,
    deperdition_enveloppe: d_mur + d_pb + d_ph + d_bv + d_porte + d_pt + hvent + hperm
  };
}
