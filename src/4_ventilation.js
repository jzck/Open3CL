import enums from './enums.js';
import { tv, requestInputID, requestInput, bug_for_bug_compat } from './utils.js';
import calc_pvent from './5_conso_ventilation.js';

const scriptName = new URL(import.meta.url).pathname.split('/').pop();

function tv_debits_ventilation(di, de, du) {
  const matcher = {
    enum_type_ventilation_id: requestInputID(de, du, 'type_ventilation')
  };

  const row = tv('debits_ventilation', matcher);
  if (row) {
    di.qvarep_conv = Number(row.qvarep_conv);
    di.qvasouf_conv = Number(row.qvasouf_conv);
    di.smea_conv = Number(row.smea_conv);
    de.tv_debits_ventilation_id = Number(row.tv_debits_ventilation_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour debits_ventilation !!');
  }
}

function tv_q4pa_conv(di, de, cg, mur_list, ph_list, porte_list, bv_list) {
  const surfaces = mur_list.concat(ph_list);
  const surface_isolee = surfaces.reduce((acc, s) => {
    const type_isolation = enums.type_isolation[s.donnee_entree.enum_type_isolation_id];
    if (s.donnee_intermediaire.b === 0) return acc;
    if (['non isolé', 'inconnu'].includes(type_isolation)) return acc;
    else return acc + s.donnee_entree.surface_paroi_opaque;
  }, 0);
  const surface_non_isolee = surfaces.reduce((acc, s) => {
    const type_isolation = enums.type_isolation[s.donnee_entree.enum_type_isolation_id];
    if (s.donnee_intermediaire.b === 0) return acc;
    if (['non isolé', 'inconnu'].includes(type_isolation)) {
      return acc + s.donnee_entree.surface_paroi_opaque;
    } else return acc;
  }, 0);
  let isolation_surfaces = surface_isolee > surface_non_isolee ? '1' : '0';

  // presence joints menuiserie
  let surface_bv_avec_joint = bv_list.reduce((acc, bv) => {
    if (bv.donnee_entree.presence_joint) return acc + bv.donnee_entree.surface_totale_baie;
    else return 0;
  }, 0);
  surface_bv_avec_joint += porte_list.reduce((acc, porte) => {
    if (porte.donnee_entree.presence_joint) return acc + porte.donnee_entree.surface_porte;
    else return 0;
  }, 0);
  let surface_bv_sans_joint = bv_list.reduce((acc, bv) => {
    if (!bv.donnee_entree.presence_joint) return acc + bv.donnee_entree.surface_totale_baie;
    else return 0;
  }, 0);
  surface_bv_sans_joint += porte_list.reduce((acc, porte) => {
    if (!porte.donnee_entree.presence_joint) return acc + porte.donnee_entree.surface_porte;
    else return 0;
  }, 0);
  let pjt =
    surface_bv_avec_joint / (surface_bv_avec_joint + surface_bv_sans_joint) > 0.5 ? '1' : '0';

  if (de.tv_q4pa_conv_id === 12 && pjt === '0') {
    // cf 2387E0992815Q
    // cf 2387E0430619S
    console.warn(`BUG(${scriptName}) us: pjt=0, them: pjt=1`);
    if (bug_for_bug_compat) pjt = '1';
  }

  if ([10, 11].includes(de.tv_q4pa_conv_id) && isolation_surfaces === '0') {
    // cf 2287E1489258O
    console.warn(`BUG(${scriptName}) us: isolation_surface=0, them: isolation_surfaces=1`);
    if (bug_for_bug_compat) isolation_surfaces = 1;
  }

  const matcher = {
    enum_periode_construction_id: cg.enum_periode_construction_id,
    enum_methode_application_dpe_log_id: cg.enum_methode_application_dpe_log_id,
    isolation_surfaces,
    presence_joints_menuiserie: pjt
  };
  const row = tv('q4pa_conv', matcher);
  if (row) {
    di.q4pa_conv = Number(row.q4pa_conv);
    de.tv_q4pa_conv_id = Number(row.tv_q4pa_conv_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour q4pa_conv !!');
  }
}

const e_tab = {
  1: 0.07,
  0: 0.02
};

const f_tab = {
  1: 15,
  0: 20
};

function calc_hperm(di, Sh, Hsp, Sdep, pfe) {
  const e = e_tab[pfe];
  const f = f_tab[pfe];
  const Q4pa_env = di.q4pa_conv * Sdep;
  const Q4pa = Q4pa_env + 0.45 * di.smea_conv * Sh;
  const n50 = Q4pa / ((4 / 50) ** (2 / 3) * Hsp * Sh);
  const Qvinf =
    (Hsp * Sh * n50 * e) / (1 + (f / e) * ((di.qvasouf_conv - di.qvarep_conv) / (Hsp * n50)) ** 2);
  console.warn(
    `q4pa_env: ${Q4pa_env}  q4pa: ${Q4pa} n50: ${n50} qvinf: ${Qvinf} e: ${e} f: ${f} Sh: ${Sh}`
  );
  di.hperm = 0.34 * Qvinf;
}

export default function calc_ventilation(vt, cg, th, Sdep, mur_list, ph_list, porte_list, bv_list) {
  const de = vt.donnee_entree;
  const du = {};
  const di = {};

  let Sh;
  if (th === 'maison' || th === 'appartement') Sh = cg.surface_habitable_logement;
  else if (th === 'immeuble') Sh = cg.surface_habitable_immeuble;
  const Hsp = cg.hsp;

  tv_debits_ventilation(di, de, du);
  tv_q4pa_conv(di, de, cg, mur_list, ph_list, porte_list, bv_list);

  di.hvent = 0.34 * di.qvarep_conv * Sh;

  const pfe = requestInput(de, du, 'plusieurs_facade_exposee', 'bool');
  calc_hperm(di, Sh, Hsp, Sdep, pfe);
  calc_pvent(di, de, du, th);

  delete di.qvarep_conv;
  delete di.qvasouf_conv;
  delete di.smea_conv;

  vt.donnee_intermediaire = di;
  vt.donnee_utilisateur = du;
}
