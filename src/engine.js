import enums from './enums.js';
import calc_deperdition from './3_deperdition.js';
import calc_apport_et_besoin from './apport_et_besoin.js';
import calc_inertie from './7_inertie.js';
import calc_clim from './10_clim.js';
import calc_ecs from './11_ecs.js';
import calc_besoin_ch from './9_besoin_ch.js';
import calc_chauffage from './9_chauffage.js';
import calc_confort_ete from './2021_04_13_confort_ete.js';
import calc_qualite_isolation from './2021_04_13_qualite_isolation.js';
import calc_conso from './conso.js';
import { add_references } from './utils.js';

function calc_th(map_id) {
	let map = enums.methode_application_dpe_log[map_id];
	if (map.includes('dpe maison individuelle')) return 'maison';
	else if (map.includes('dpe appartement individuel')) return 'appartement';
	else if (map.includes('dpe immeuble collectif')) return 'immeuble';
	return null;
}

export function calcul_3cl(dpe) {
	let modele = enums.modele_dpe[dpe.administratif.enum_modele_dpe_id];
	if (modele != 'dpe 3cl 2021 méthode logement') {
		console.error('Moteur dpe non implémenté pour le modèle: ' + modele);
		return null;
	}
	const logement = dpe.logement;
	const cg = logement.caracteristique_generale;
	const map_id = cg.enum_methode_application_dpe_log_id;
	let th = calc_th(map_id);

	if (logement.enveloppe === undefined) {
		console.warn('vide: logement.enveloppe');
		return null;
	} else if (logement.enveloppe.mur_collection === undefined) {
		console.warn('vide: logement.enveloppe.mur_collection');
		return null;
	}

	add_references(logement.enveloppe)

	dpe.administratif.diagnostiqueur = { version_logiciel: 'Open3CL v0' };
	const env = logement.enveloppe;
	let Sh;
	// TODO requestInput Sh
	if (th === 'maison' || th === 'appartement') Sh = cg.surface_habitable_logement;
	else if (th === 'immeuble') Sh = cg.surface_habitable_immeuble;

	const zc_id = logement.meteo.enum_zone_climatique_id;
	const ca_id = logement.meteo.enum_classe_altitude_id;

	const instal_ch = logement.installation_chauffage_collection.installation_chauffage;
	let ej =
		instal_ch[0].generateur_chauffage_collection.generateur_chauffage[0].donnee_entree
			.enum_type_energie_id === '1'
			? '1'
			: '0';

	const deperdition = calc_deperdition(cg, zc_id, th, ej, env, logement);
	const GV = deperdition.deperdition_enveloppe;

	env.inertie = calc_inertie(env);
	const inertie_id = env.inertie.enum_classe_inertie_id;
	const inertie = enums.classe_inertie[inertie_id];
	const ilpa =
		logement.meteo.batiment_materiaux_anciens === 1 && inertie.includes('lourde') ? '1' : '0';

	const ecs = logement.installation_ecs_collection.installation_ecs || [];
	const Nb_lgt = cg.nombre_appartement || 1;
	const hsp = cg.hsp;
	const clim = logement.climatisation_collection.climatisation || [];
	let apport_et_besoin = calc_apport_et_besoin(
		env,
		th,
		ecs,
		clim,
		Sh,
		Nb_lgt,
		GV,
		ilpa,
		ca_id,
		zc_id
	);

	let bfr = apport_et_besoin.besoin_fr;
	let bfr_dep = apport_et_besoin.besoin_fr_depensier;
	clim.forEach((clim) => calc_clim(clim, bfr, bfr_dep, zc_id, Sh));

	let becs = apport_et_besoin.besoin_ecs;
	let becs_dep = apport_et_besoin.besoin_ecs_depensier;
	ecs.forEach((ecs) => calc_ecs(ecs, becs, becs_dep, GV, ca_id, zc_id));

	let ac = cg.annee_construction;
	// needed for apport_et_besoin
	instal_ch.forEach((ch) => {
		calc_chauffage(ch, ca_id, zc_id, inertie_id, map_id, 0, 0, GV, Sh, hsp, ac);
	});

	let bv_list = env.baie_vitree_collection.baie_vitree;
	const besoin_ch = calc_besoin_ch(
		ilpa,
		ca_id,
		zc_id,
		inertie_id,
		Sh,
		GV,
		apport_et_besoin.nadeq,
		ecs,
		instal_ch,
		bv_list
	);
	apport_et_besoin = { ...apport_et_besoin, ...besoin_ch };

	let bch = apport_et_besoin.besoin_ch;
	let bch_dep = apport_et_besoin.besoin_ch_depensier;
	instal_ch.forEach((ch) =>
		calc_chauffage(ch, ca_id, zc_id, inertie_id, map_id, bch, bch_dep, GV, Sh, hsp, ac)
	);

	const vt_list = logement.ventilation_collection.ventilation;
	const conso = calc_conso(Sh, zc_id, ca_id, vt_list, instal_ch, ecs, clim);

	const production_electricite = {
		conso_elec_ac: 0,
		conso_elec_ac_autre_usage: 0,
		conso_elec_ac_auxiliaire: 0,
		conso_elec_ac_ch: 0,
		conso_elec_ac_eclairage: 0,
		conso_elec_ac_ecs: 0,
		conso_elec_ac_fr: 0,
		production_pv: 0
	};

	// get all baie_vitree orientations
	let ph_list = env.plancher_haut_collection.plancher_haut || [];
	logement.sortie = {
		deperdition: deperdition,
		apport_et_besoin: apport_et_besoin,
		confort_ete: calc_confort_ete(inertie_id, bv_list, ph_list),
		qualite_isolation: calc_qualite_isolation(env, deperdition),
		production_electricite: production_electricite,
		...conso
	};

	return dpe;
}
