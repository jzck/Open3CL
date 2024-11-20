import enums from './enums.js';
import { tv, requestInputID, requestInput, bug_for_bug_compat } from './utils.js';
import calc_pvent from './5_conso_ventilation.js';

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

  if (bug_for_bug_compat && de.tv_q4pa_conv_id) {
    const rowQ4paConv = tv('q4pa_conv', {
      tv_q4pa_conv_id: de.tv_q4pa_conv_id
    });

    if (rowQ4paConv) {
      if (rowQ4paConv.isolation_surfaces !== isolation_surfaces) {
        console.error(
          `Calcul de hperm pour la ventilation ${de.description}. Le DPE considère isolation_surfaces = ${rowQ4paConv.isolation_surfaces} 
          alors que ce devrait être isolation_surfaces = ${isolation_surfaces}. La valeur du DPE isolation_surfaces = ${rowQ4paConv.isolation_surfaces} est utilisée.`
        );
        isolation_surfaces = rowQ4paConv.isolation_surfaces;
      }

      if (rowQ4paConv.presence_joints_menuiserie !== pjt) {
        console.error(
          `Calcul de hperm pour la ventilation ${de.description}. Le DPE considère presence_joints_menuiserie = ${rowQ4paConv.presence_joints_menuiserie} 
          alors que ce devrait être presence_joints_menuiserie = ${pjt}. La valeur du DPE presence_joints_menuiserie = ${rowQ4paConv.presence_joints_menuiserie} est utilisée.`
        );
        pjt = rowQ4paConv.presence_joints_menuiserie;
      }
    }
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

function calc_hperm(di, surface_ventile, Hsp, Sdep, pfe) {
  const e = e_tab[pfe];
  const f = f_tab[pfe];
  const Q4pa_env = di.q4pa_conv * Sdep;
  const Q4pa = Q4pa_env + 0.45 * di.smea_conv * surface_ventile;
  const n50 = Q4pa / ((4 / 50) ** (2 / 3) * Hsp * surface_ventile);
  const Qvinf =
    (Hsp * surface_ventile * n50 * e) /
    (1 + (f / e) * ((di.qvasouf_conv - di.qvarep_conv) / (Hsp * n50)) ** 2);
  di.hperm = 0.34 * Qvinf;
}

export default function calc_ventilation(
  vt,
  cg,
  th,
  Sdep,
  Sh,
  mur_list,
  ph_list,
  porte_list,
  bv_list
) {
  const de = vt.donnee_entree;
  const du = {};
  const di = {};

  let surface_ventile = requestInput(de, du, 'surface_ventile', 'float');

  if (!surface_ventile) {
    surface_ventile = Sh;
  } else if (surface_ventile !== Sh) {
    // S'il y a une répartition alors c'est que la vmc est collective. La surface à prendre en compte est la surface de l'immeuble
    surface_ventile /= de.cle_repartition_ventilation || 1;
  }

  const Hsp = cg.hsp;

  tv_debits_ventilation(di, de, du);
  tv_q4pa_conv(di, de, cg, mur_list, ph_list, porte_list, bv_list);

  di.hvent = 0.34 * di.qvarep_conv * surface_ventile;

  let pfe = requestInput(de, du, 'plusieurs_facade_exposee', 'bool');

  /**
   * Si une fiche technique pour cette variable est présente, elle est prise en compte
   * Les valeurs de plusieurs_facade_exposee n'étant pas toujours utilisées de la même manière
   * dans tous les DPEs (parfois 0 = 'Oui', d'autres 0 = 'Non')
   */
  if (de.ficheTechniqueFacadesExposees) {
    const pfeFicheTechnique = ['non', 'une'].includes(
      de.ficheTechniqueFacadesExposees.valeur.toLowerCase()
    )
      ? 0
      : 1;

    if (pfeFicheTechnique !== pfe) {
      console.error(
        `La valeur de la variable plusieurs_facade_exposee ne correspond pas à celle présente 
        dans la fiche technique "${de.ficheTechniqueFacadesExposees.description}". 
        La valeur de la fiche technique est prise en compte.`
      );
    }

    pfe = pfeFicheTechnique;
  }

  calc_hperm(di, surface_ventile, Hsp, Sdep, pfe);
  calc_pvent(di, de, du, th);

  delete di.qvarep_conv;
  delete di.qvasouf_conv;
  delete di.smea_conv;

  vt.donnee_intermediaire = di;
  vt.donnee_utilisateur = du;
}
