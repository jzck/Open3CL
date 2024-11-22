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
    if (mur.donnee_intermediaire.b === 0) return acc;
    if (type_adjacence.includes('local non déperditif')) return acc;
    else return acc + Number(mur.donnee_entree.surface_paroi_opaque);
  }, 0);
  const Sporte = porte_list.reduce((acc, porte) => {
    if (porte.donnee_intermediaire.b === 0) return acc;
    return acc + Number(porte.donnee_entree.surface_porte);
  }, 0);
  const Sbv = bv_list.reduce((acc, bv) => {
    if (bv.donnee_intermediaire.b === 0) return acc;
    return acc + Number(bv.donnee_entree.surface_totale_baie);
  }, 0);
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

/**
 * Compare la liste des ponts thermiques déclarés et calculés
 * Retourne true si individuellement chacun des ponts thermiques est identique
 * @param calculatedPTs
 * @param declaredPTs
 * @returns {boolean}
 */
function verifyPontsThermiquesEquality(calculatedPTs, declaredPTs) {
  /**
   * Pour les ponts thermiques déclarés, le facteur deperdition_pont_thermique étant déjà pris en compte, seul k est considéré
   */
  const uptForCalculatedPTs = calculatedPTs.map(
    (calculatedPT) =>
      calculatedPT.donnee_intermediaire.k *
      (calculatedPT.donnee_entree.pourcentage_valeur_pont_thermique || 1)
  );
  const uptForDeclaredPTs = declaredPTs.map((declaredPT) => declaredPT.donnee_intermediaire.k);

  return (
    calculatedPTs.length === declaredPTs.length &&
    !uptForCalculatedPTs.some((val, i) => {
      return (
        val.toFixed(3) !== uptForDeclaredPTs[i].toFixed(3) &&
        val.toFixed(3) !==
          (
            uptForDeclaredPTs[i] *
            (calculatedPTs[i].donnee_entree.pourcentage_valeur_pont_thermique || 1)
          ).toFixed(3)
      );
    })
  );
}

/**
 * Compare la liste des murs déclarés et calculés
 * Retourne true si individuellement chacun des murs est identique
 * @param calculatedMurs
 * @param declaredMurs
 * @returns {boolean}
 */
function verifyMursEquality(calculatedMurs, declaredMurs) {
  const uMurForCalculatedMurs = calculatedMurs.map(
    (calculatedMur) =>
      calculatedMur.donnee_entree.surface_paroi_opaque *
      calculatedMur.donnee_intermediaire.umur *
      calculatedMur.donnee_intermediaire.b
  );
  const uMurForDeclaredMurs = declaredMurs.map(
    (declaredMur) =>
      declaredMur.donnee_entree.surface_paroi_opaque *
      declaredMur.donnee_intermediaire.umur *
      declaredMur.donnee_intermediaire.b
  );

  return (
    calculatedMurs.length === declaredMurs.length &&
    !uMurForCalculatedMurs.some((val, i) => val.toFixed(3) !== uMurForDeclaredMurs[i].toFixed(3))
  );
}

/**
 * Calcul de la déperdition totale liée aux ponts thermiques
 * @param dpe {FullDpe}
 * @param calculatedPontsThermiques
 * @param declaredPontsThermiques
 * @return {number}
 */
function totalDeperditionPontThermique(dpe, calculatedPontsThermiques, declaredPontsThermiques) {
  // Total déclaré des déperditions des ponts thermiques
  const declaredDeperditionPT = dpe.logement.sortie.deperdition.deperdition_pont_thermique;

  /**
   * Comparaison des valeurs intermédiaires calculées et déclarées pour chacun des ponts thermiques
   * @type {boolean}
   */
  const sameValues = verifyPontsThermiquesEquality(
    calculatedPontsThermiques,
    declaredPontsThermiques
  );

  const calculatedDeperditionPT = calculatedPontsThermiques.reduce(
    (acc, pt) => acc + Upt(pt) || 0,
    0
  );

  /**
   * Si individuellement les ponts thermiques déclarés et calculés sont identiques, la déperdition totale devrait l'être également
   * Pour certains DPE, il réside une différence que l'on prendra en compte pour la suite des calculs.
   */
  if (sameValues && calculatedDeperditionPT.toFixed(5) !== declaredDeperditionPT.toFixed(5)) {
    console.error(
      `Les valeurs des ponts thermiques calculées et déclarées pour le DPE ${dpe.numero_dpe} sont les mêmes mais le total des déperditions pour les ponts thermiques
       ${declaredDeperditionPT} diffère du total calculé avec les mêmes valeurs ${declaredDeperditionPT}'. Le total déclaré est conservé.`
    );
    return declaredDeperditionPT;
  }
  return calculatedDeperditionPT;
}

/**
 * Calcul de la déperdition totale liée aux murs
 * @param dpe {FullDpe}
 * @param calculatedMurs
 * @param declaredMurs
 * @return {number}
 */
function totalDeperditionMurs(dpe, calculatedMurs, declaredMurs) {
  // Total déclaré des déperditions des murs
  const declaredDeperditionMurs = dpe.logement.sortie.deperdition.deperdition_mur;

  /**
   * Comparaison des valeurs intermédiaires calculées et déclarées pour chacun des murs
   * @type {boolean}
   */
  const sameValues = verifyMursEquality(calculatedMurs, declaredMurs);

  const calculatedDeperditionMur = calculatedMurs.reduce((acc, mur) => acc + Umur(mur) || 0, 0);

  /**
   * Si individuellement les murs déclarés et calculés sont identiques, la déperdition totale devrait l'être également
   * Pour certains DPE, il réside une différence que l'on prendra en compte pour la suite des calculs.
   */
  if (sameValues && calculatedDeperditionMur.toFixed(5) !== declaredDeperditionMurs.toFixed(5)) {
    if (declaredDeperditionMurs.toFixed(5) > calculatedDeperditionMur.toFixed(5)) {
      console.error(
        `Les valeurs des murs calculées et déclarées pour le DPE ${dpe.numero_dpe} sont les mêmes mais le total déclaré des déperditions pour les murs
       '${declaredDeperditionMurs}' diffère et est supérieure au total calculé avec les mêmes valeurs '${calculatedDeperditionMur}'. Le total déclaré est conservé.`
      );

      return declaredDeperditionMurs;
    } else {
      console.error(
        `Les valeurs des murs calculées et déclarées pour le DPE ${dpe.numero_dpe} sont les mêmes mais le total déclaré des déperditions pour les murs
       '${declaredDeperditionMurs}' diffère et est inférieure au total calculé avec les mêmes valeurs '${calculatedDeperditionMur}'. Le total calculé est conservé.`
      );

      return calculatedDeperditionMur;
    }
  }
  return calculatedDeperditionMur;
}

export function Upt(pt) {
  const de = pt.donnee_entree;
  const di = pt.donnee_intermediaire;

  return de.l * di.k * (de.pourcentage_valeur_pont_thermique || 1);
}

export default function calc_deperdition(cg, zc, th, effetJoule, dpe, Sh) {
  const pc = cg.enum_periode_construction_id;
  const logement = dpe.logement;
  const enveloppe = logement.enveloppe;

  const mur_list = enveloppe.mur_collection.mur || [];
  const declaredMurs = structuredClone(mur_list);
  const pb_list = enveloppe.plancher_bas_collection.plancher_bas || [];
  const ph_list = enveloppe.plancher_haut_collection.plancher_haut || [];
  const porte_list = enveloppe.porte_collection.porte || [];
  const bv_list = enveloppe.baie_vitree_collection.baie_vitree || [];
  const pt_list = enveloppe.pont_thermique_collection.pont_thermique || [];
  const declaredPontsThermiques = structuredClone(pt_list);
  const vt_list = logement.ventilation_collection.ventilation || [];

  mur_list.forEach((mur) => calc_mur(mur, zc, pc, effetJoule));
  pb_list.forEach((pb) => calc_pb(pb, zc, pc, effetJoule, pb_list));
  ph_list.forEach((ph) => calc_ph(ph, zc, pc, effetJoule));
  bv_list.forEach((bv) => calc_bv(bv, zc));
  porte_list.forEach((porte) => calc_porte(porte, zc));
  pt_list.forEach((pt) => calc_pont_thermique(pt, pc, logement));

  const murs_list = mur_list.concat(ph_list);
  const Sdep = calc_Sdep(murs_list, porte_list, bv_list);

  vt_list.forEach((vt) => {
    calc_ventilation(vt, cg, th, Sdep, Sh, mur_list, ph_list, porte_list, bv_list);
  });

  const d_mur = totalDeperditionMurs(dpe, mur_list, declaredMurs);
  const d_pb = pb_list.reduce((acc, pb) => acc + Upb(pb) || 0, 0);
  const d_ph = ph_list.reduce((acc, ph) => acc + Uph(ph) || 0, 0);
  const d_bv = bv_list.reduce((acc, bv) => acc + Ubv(bv) || 0, 0);
  const d_porte = porte_list.reduce((acc, porte) => acc + Uporte(porte) || 0, 0);
  const d_pt = totalDeperditionPontThermique(dpe, pt_list, declaredPontsThermiques);
  const hvent = vt_list.reduce((acc, vt) => acc + vt.donnee_intermediaire.hvent || 0, 0);
  const hperm = vt_list.reduce((acc, vt) => acc + vt.donnee_intermediaire.hperm || 0, 0);

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
