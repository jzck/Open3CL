/**
 * @returns {number}
 */
function qualite_isol(dep, surface, seuil1, seuil2, seuil3) {
  /**
   * 1 - Très bonne
   * 2 - Bonne
   * 3 - Moyenne
   * 4 - Insuffisante
   */
  let u = 0;

  if (dep && surface) {
    u = dep / surface;
  }

  if (u < seuil1) return 1;
  else if (u < seuil2) return 2;
  else if (u < seuil3) return 3;
  return 4;
}

export default function calc_qualite_isolation(enveloppe, dp) {
  /**
   * enum_type_adjacence_id = 22 - Local non déperditif (local à usage d'habitation chauffé)
   */
  const mur_list = (enveloppe.mur_collection.mur || []).filter(
    (mur) => mur.donnee_entree.enum_type_adjacence_id !== '22' && mur.donnee_intermediaire.b > 0
  );

  const planchersHauts = enveloppe.plancher_haut_collection.plancher_haut || [];
  const planchersBas = (enveloppe.plancher_bas_collection.plancher_bas || []).filter(
    (mur) => mur.donnee_entree.enum_type_adjacence_id !== '22'
  );
  const baiesVitrees = (enveloppe.baie_vitree_collection.baie_vitree || []).filter(
    (porte) => porte.donnee_intermediaire.b > 0
  );
  const portes = (enveloppe.porte_collection.porte || []).filter(
    (porte) => porte.donnee_intermediaire.b > 0
  );

  let phCombleAmenagee = [];
  let phCombleToitTerrasse = [];
  let phComblePerdue = [];

  planchersHauts.forEach((plancherHaut) => {
    if (plancherHaut.donnee_entree.enum_type_adjacence_id !== '1') {
      phComblePerdue.push(plancherHaut);
    } else {
      if (
        plancherHaut.donnee_entree.enum_type_plancher_haut_id === '12' ||
        plancherHaut.donnee_entree.description?.toLowerCase().indexOf('combles aménagés') !== -1
      ) {
        phCombleAmenagee.push(plancherHaut);
      } else {
        phCombleToitTerrasse.push(plancherHaut);
      }
    }
  });

  const Umurs = mur_list.reduce(
    (acc, mur) => acc + mur.donnee_entree.surface_paroi_opaque * mur.donnee_intermediaire.umur,
    0
  );
  const surfaceMurs = mur_list.reduce(
    (acc, mur) => acc + mur.donnee_entree.surface_paroi_opaque,
    0
  );

  const UplancherBas = planchersBas.reduce(
    (acc, pb) => acc + pb.donnee_entree.surface_paroi_opaque * pb.donnee_intermediaire.upb,
    0
  );
  const surfacePlanchersBas = planchersBas.reduce(
    (acc, pb) => acc + pb.donnee_entree.surface_paroi_opaque,
    0
  );

  const UphComblesAmenagees = phCombleAmenagee.reduce(
    (acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque * ph.donnee_intermediaire.uph,
    0
  );
  const UphComblesPerdues = phComblePerdue.reduce(
    (acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque * ph.donnee_intermediaire.uph,
    0
  );
  const UphToitsTerrasses = phCombleToitTerrasse.reduce(
    (acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque * ph.donnee_intermediaire.uph,
    0
  );

  const surfaceComblesAmenagees = phCombleAmenagee
    .filter((mur) => mur.donnee_entree.enum_type_adjacence_id !== '22')
    .reduce((acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque, 0);
  const surfaceComblesPerdues = phComblePerdue
    .filter((mur) => mur.donnee_entree.enum_type_adjacence_id !== '22')
    .reduce((acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque, 0);
  const surfaceToitsTerrasses = phCombleToitTerrasse
    .filter((mur) => mur.donnee_entree.enum_type_adjacence_id !== '22')
    .reduce((acc, ph) => acc + ph.donnee_entree.surface_paroi_opaque, 0);

  const Umenuiseries =
    baiesVitrees.reduce(
      (acc, bv) =>
        acc + bv.donnee_entree.surface_totale_baie * bv.donnee_intermediaire.u_menuiserie,
      0
    ) +
    portes.reduce(
      (acc, porte) => acc + porte.donnee_entree.surface_porte * porte.donnee_intermediaire.uporte,
      0
    );
  const surfacePortes = portes.reduce((acc, porte) => acc + porte.donnee_entree.surface_porte, 0);
  const surfaceBaiesVitrees = baiesVitrees.reduce(
    (acc, bv) => acc + bv.donnee_entree.surface_totale_baie,
    0
  );

  const deperdition =
    dp.deperdition_mur +
    dp.deperdition_plancher_bas +
    dp.deperdition_plancher_haut +
    dp.deperdition_baie_vitree +
    dp.deperdition_porte +
    dp.deperdition_pont_thermique;
  const surfacePlanchersHauts =
    surfaceComblesAmenagees + surfaceComblesPerdues + surfaceToitsTerrasses;
  const surfaceDeperditives =
    surfaceMurs + surfacePlanchersBas + surfacePlanchersHauts + surfaceBaiesVitrees + surfacePortes;
  const ubat = deperdition / surfaceDeperditives;

  const ret = {
    ubat,
    qualite_isol_enveloppe: qualite_isol(deperdition, surfaceDeperditives, 0.45, 0.65, 0.85),
    qualite_isol_mur: qualite_isol(Umurs, surfaceMurs, 0.3, 0.45, 0.65),
    qualite_isol_plancher_bas: qualite_isol(UplancherBas, surfacePlanchersBas, 0.25, 0.45, 0.65),
    qualite_isol_menuiserie: qualite_isol(
      Umenuiseries,
      surfaceBaiesVitrees + surfacePortes,
      1.6,
      2.2,
      3
    )
  };

  if (UphComblesAmenagees > 0) {
    ret.qualite_isol_plancher_haut_comble_amenage = qualite_isol(
      UphComblesAmenagees,
      surfaceComblesAmenagees,
      0.18,
      0.25,
      0.3
    );
  }
  if (UphToitsTerrasses > 0) {
    ret.qualite_isol_plancher_haut_toit_terrasse = qualite_isol(
      UphToitsTerrasses,
      surfaceToitsTerrasses,
      0.25,
      0.3,
      0.35
    );
  }
  if (UphComblesPerdues > 0) {
    ret.qualite_isol_plancher_haut_comble_perdu = qualite_isol(
      UphComblesPerdues,
      surfaceComblesPerdues,
      0.15,
      0.2,
      0.3
    );
  }

  return ret;
}
