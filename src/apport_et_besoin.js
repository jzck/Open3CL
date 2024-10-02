import enums from './enums.js';
import { calc_sse } from './6.2_surface_sud_equivalente.js';
import calc_besoin_fr from './10_besoin_fr.js';
import calc_besoin_ecs from './11_besoin_ecs.js';
import { calc_nadeq_collectif, calc_nadeq_individuel } from './11_nadeq.js';
import { calc_as, calc_ai } from './6.1_apport_gratuit.js';

export default function calc_apport_et_besoin(
  enveloppe,
  th,
  ecs,
  clim,
  Sh,
  Nb_lgt,
  GV,
  ilpa,
  ca_id,
  zc_id
) {
  const zc = enums.zone_climatique[zc_id];
  const ca = enums.classe_altitude[ca_id];
  const inertie = enums.classe_inertie[enveloppe.inertie.enum_classe_inertie_id];

  const bv = enveloppe.baie_vitree_collection.baie_vitree;
  let nadeq;
  if (th === 'maison') nadeq = calc_nadeq_individuel(Sh, Nb_lgt);
  else if (th === 'appartement') nadeq = calc_nadeq_collectif(Sh, 1);
  else nadeq = calc_nadeq_collectif(Sh, Nb_lgt);
  const besoin_ecs = calc_besoin_ecs(ilpa, ca, zc, Sh, nadeq);
  const besoin_fr = calc_besoin_fr(ilpa, ca, zc, Sh, nadeq, GV, inertie, bv);
  const apport_interne = calc_ai(ilpa, ca, zc, Sh, nadeq);
  const apport_solaire = calc_as(ilpa, ca, zc, bv);

  if (clim.length === 0) {
    besoin_fr.besoin_fr = 0;
    besoin_fr.besoin_fr_depensier = 0;
    apport_interne.apport_interne_fr = 0;
    apport_solaire.apport_solaire_fr = 0;
  }

  const ret = {
    nadeq,
    v40_ecs_journalier: nadeq * 56,
    v40_ecs_journalier_depensier: nadeq * 79,
    surface_sud_equivalente: calc_sse(zc, bv),
    ...besoin_ecs,
    ...apport_interne,
    ...apport_solaire,
    ...besoin_fr
  };
  return ret;
}
