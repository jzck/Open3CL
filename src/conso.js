import enums from './enums.js';
import calc_conso_eclairage from './16_conso_eclairage.js';

let coef_ep = {
	'électricité ch': 2.3,
	'électricité ecs': 2.3,
	'électricité fr': 2.3,
	'électricité éclairage': 2.3,
	'électricité auxiliaire': 2.3
};

// 31 mars 2021
// https://www.legifrance.gouv.fr/download/pdf?id=doxMrRr0wbfJVvtWjfDP4gHzzERt1iX0PtobthCE6A0=
let coef_ges = {
	'bois – bûches': 0.03,
	'bois – granulés (pellets) ou briquettes': 0.03,
	'bois – plaquettes forestières': 0.024,
	'bois – plaquettes d’industrie': 0.024,
	'gaz naturel': 0.227,
	'fioul domestique': 0.324,
	charbon: 0.385,
	"électricité d'origine renouvelable utilisée dans le bâtiment": 0,
	'électricité ch': 0.079,
	'électricité ecs': 0.065,
	'électricité fr': 0.064,
	'électricité éclairage': 0.069,
	'électricité auxiliaire': 0.064
};

// annexe 7
// https://www.legifrance.gouv.fr/download/file/doxMrRr0wbfJVvtWjfDP4qE7zNsiFZL-4wqNyqoY-CA=/JOE_TEXTE
let coef_cout = {
	'fioul domestique': 0.09142,
	'réseau de chauffage urbain': 0.0787,
	propane: 0.14305,
	butane: 0.20027,
	charbon: 0.02372,
	'bois – granulés (pellets) ou briquettes': 0.05991,
	'bois – bûches': 0.03201,
	'bois – plaquettes forestières': 0.03201,
	'bois – plaquettes d’industrie': 0.03201,
	// https://www.legifrance.gouv.fr/download/pdf?id=7hpbVyq228foxHzNM7WleDImAyXlPNb9zULelSY01V8=
	'gaz naturel': cout_gaz_naturel,
	"électricité d'origine renouvelable utilisée dans le bâtiment": cout_electricite,
	'électricité ch': cout_electricite,
	'électricité ecs': cout_electricite,
	'électricité fr': cout_electricite,
	'électricité éclairage': cout_electricite,
	'électricité auxiliaire': cout_electricite
};

function cout_gaz_naturel(cef) {
	if (cef < 5009) return 0.11121 * cef;
	else if (conso < 50055) return 230 + 0.06533 * cef;
	else return 415 + 0.06164 * cef;
}

function cout_electricite(cef) {
	if (cef < 1000) return 0.29007 * cef;
	else if (cef < 2500) return 149 + 0.14066 * cef;
	else if (cef < 5000) return 122 + 0.15176 * cef;
	else if (cef < 15000) return 94 + 0.15735 * cef;
	else return 56 + 0.15989 * cef;
}

function getConso(coef, type_energie, conso) {
	// is coef is a function, execute it
	if (!coef) return conso;
	let coef_val = coef[type_energie];
	if (typeof coef_val === 'function') {
		let val = coef_val(conso);
		return val;
	}
	if (coef_val) return coef_val * conso;
	return conso;
}

export default function calc_conso(Sh, zc_id, ca_id, vt, ch, ecs, fr) {
	let gen_ch = ch.reduce(
		(acc, ch) => acc.concat(ch.generateur_chauffage_collection.generateur_chauffage),
		[]
	);
	let gen_ecs = ecs.reduce(
		(acc, ecs) => acc.concat(ecs.generateur_ecs_collection.generateur_ecs),
		[]
	);

	let ret = {
		ef_conso: calc_conso_pond(Sh, zc_id, vt, gen_ch, gen_ecs, fr, 'conso', null),
		ep_conso: calc_conso_pond(Sh, zc_id, vt, gen_ch, gen_ecs, fr, 'ep_conso', coef_ep),
		emission_ges: calc_conso_pond(Sh, zc_id, vt, gen_ch, gen_ecs, fr, 'emission_ges', coef_ges),
		cout: calc_conso_pond(Sh, zc_id, vt, gen_ch, gen_ecs, fr, 'cout', coef_cout)
	};
	ret.ep_conso.classe_bilan_dpe = classe_bilan_dpe(ret.ep_conso.ep_conso_5_usages_m2, zc_id, ca_id);
	ret.emission_ges.classe_emission_ges = classe_emission_ges(
		ret.emission_ges.emission_ges_5_usages_m2,
		zc_id,
		ca_id
	);

	let energie_ids = [];
	// find all type_energies in gen_ch and gen_ecs
	gen_ch.forEach((gen_ch) => {
		let id = gen_ch.donnee_entree.enum_type_energie_id;
		if (!energie_ids.includes(id)) energie_ids.push(id);
	});
	gen_ecs.forEach((gen_ecs) => {
		let id = gen_ecs.donnee_entree.enum_type_energie_id;
		if (!energie_ids.includes(id)) energie_ids.push(id);
	});
	if (!energie_ids.includes('1')) energie_ids.push('1');
	// calculate calc_conso_pond for each energy type
	ret.sortie_par_energie_collection = {};
	ret.sortie_par_energie_collection.sortie_par_energie = energie_ids.reduce((acc, energie_id) => {
		let type_energie = enums.type_energie[energie_id];
		let vt_en, fr_en;
		if (type_energie === 'électricité') {
			vt_en = vt;
			fr_en = fr;
		} else {
			vt_en = [];
			fr_en = [];
		}
		let gen_ch_en = gen_ch.filter(
			(gen_ch) => gen_ch.donnee_entree.enum_type_energie_id == type_energie
		);
		let gen_ecs_en = gen_ecs.filter(
			(gen_ecs) => gen_ecs.donnee_entree.enum_type_energie_id == type_energie
		);
		let conso_en = calc_conso_pond(Sh, zc_id, vt_en, gen_ch_en, gen_ecs_en, fr_en, '', null);
		conso_en = {
			conso_ch: conso_en._ch,
			conso_ecs: conso_en._ecs,
			conso_5_usages: conso_en._5_usages,
			emission_ges_ch: conso_en._ch * coef_ges[type_energie],
			emission_ges_ecs: conso_en._ecs * coef_ges[type_energie],
			emission_ges_5_usages: conso_en._5_usages * coef_ges[type_energie]
		};
		conso_en.enum_type_energie_id = energie_id;
		return acc.concat(conso_en);
	}, []);
	return ret;
}

function classe_bilan_dpe(ep_conso_5_usages_m2, zc_id, ca_id) {
	if (!ep_conso_5_usages_m2) return null;
	if (ep_conso_5_usages_m2 < 70) return 'A';
	if (ep_conso_5_usages_m2 < 110) return 'B';
	if (ep_conso_5_usages_m2 < 180) return 'C';
	if (ep_conso_5_usages_m2 < 250) return 'D';

	let zc = enums.zone_climatique[zc_id];
	let ca = enums.classe_altitude[ca_id];

	if (['h1b', 'h1c', 'h2d'].includes(zc) && ca == 'supérieur à 800m') {
		if (ep_conso_5_usages_m2 < 390) return 'E';
		if (ep_conso_5_usages_m2 < 500) return 'F';
	} else {
		if (ep_conso_5_usages_m2 < 330) return 'E';
		if (ep_conso_5_usages_m2 < 420) return 'F';
	}
	return 'G';
}

function classe_emission_ges(emission_ges_5_usages_m2, zc_id, ca_id) {
	if (!emission_ges_5_usages_m2) return null;
	if (emission_ges_5_usages_m2 < 6) return 'A';
	if (emission_ges_5_usages_m2 < 11) return 'B';
	if (emission_ges_5_usages_m2 < 30) return 'C';
	if (emission_ges_5_usages_m2 < 50) return 'D';

	let zc = enums.zone_climatique[zc_id];
	let ca = enums.classe_altitude[ca_id];

	if (['h1b', 'h1c', 'h2d'].includes(zc) && ca == 'supérieur à 800m') {
		if (emission_ges_5_usages_m2 < 80) return 'E';
		if (emission_ges_5_usages_m2 < 110) return 'F';
	} else {
		if (emission_ges_5_usages_m2 < 70) return 'E';
		if (emission_ges_5_usages_m2 < 100) return 'F';
	}
	return 'G';
}

function calc_conso_pond(Sh, zc_id, vt_list, gen_ch, gen_ecs, fr_list, prefix, coef) {
	let ret = {};
	ret.auxiliaire_ventilation = vt_list.reduce((acc, vt) => {
		let conso = vt.donnee_intermediaire.conso_auxiliaire_ventilation || 0;
		return acc + getConso(coef, 'électricité auxiliaire', conso);
	}, 0);

	let conso_eclairage = calc_conso_eclairage(zc_id) * Sh;
	ret.eclairage = getConso(coef, 'électricité éclairage', conso_eclairage);

	//aux ch
	ret.auxiliaire_generation_ch = gen_ch.reduce((acc, gen_ch) => {
		let conso = gen_ch.donnee_intermediaire.conso_auxiliaire_generation_ch || 0;
		return acc + getConso(coef, 'électricité auxiliaire', conso);
	}, 0);

	ret.auxiliaire_generation_ch_depensier = gen_ch.reduce((acc, gen_ch) => {
		let conso = gen_ch.donnee_intermediaire.conso_auxiliaire_generation_ch_depensier || 0;
		return acc + getConso(coef, 'électricité auxiliaire', conso);
	}, 0);
	ret.auxiliaire_distribution_ch = 0;

	ret.ch = gen_ch.reduce((acc, gen_ch) => {
		let conso = gen_ch.donnee_intermediaire.conso_ch;
		let type_energie = enums.type_energie[gen_ch.donnee_entree.enum_type_energie_id];
		if (type_energie === 'électricité') type_energie = 'électricité ch';
		return acc + getConso(coef, type_energie, conso);
	}, 0);

	ret.ch_depensier = gen_ch.reduce((acc, gen_ch) => {
		let conso = gen_ch.donnee_intermediaire.conso_ch_depensier;
		let type_energie = enums.type_energie[gen_ch.donnee_entree.enum_type_energie_id];
		if (type_energie === 'électricité') type_energie = 'électricité ch';
		return acc + getConso(coef, type_energie, conso);
	}, 0);

	// ecs
	ret.auxiliaire_generation_ecs = gen_ecs.reduce((acc, gen_ecs) => {
		let conso = gen_ecs.donnee_intermediaire.conso_auxiliaire_generation_ecs || 0;
		return acc + getConso(coef, 'électricité auxiliaire', conso);
	}, 0);

	ret.auxiliaire_generation_ecs_depensier = gen_ecs.reduce((acc, gen_ecs) => {
		let conso = gen_ecs.donnee_intermediaire.conso_auxiliaire_generation_ecs_depensier || 0;
		return acc + getConso(coef, 'électricité auxiliaire', conso);
	}, 0);

	ret.auxiliaire_distribution_ecs = 0;

	ret.ecs = gen_ecs.reduce((acc, gen_ecs) => {
		let conso = gen_ecs.donnee_intermediaire.conso_ecs;
		let type_energie = enums.type_energie[gen_ecs.donnee_entree.enum_type_energie_id];
		if (type_energie === 'électricité') type_energie = 'électricité ecs';
		return acc + getConso(coef, type_energie, conso);
	}, 0);

	ret.ecs_depensier = gen_ecs.reduce((acc, gen_ecs) => {
		let conso = gen_ecs.donnee_intermediaire.conso_ecs_depensier;
		let type_energie = enums.type_energie[gen_ecs.donnee_entree.enum_type_energie_id];
		if (type_energie === 'électricité') type_energie = 'électricité ecs';
		return acc + getConso(coef, type_energie, conso);
	}, 0);

	ret.fr = fr_list.reduce((acc, fr) => {
		let conso = fr.donnee_intermediaire.conso_fr;
		let type_energie = enums.type_energie[fr.donnee_entree.enum_type_energie_id];
		if (type_energie === 'électricité') type_energie = 'électricité fr';
		return acc + getConso(coef, type_energie, conso);
	}, 0);

	ret.fr_depensier = fr_list.reduce((acc, fr) => {
		let conso = fr.donnee_intermediaire.conso_fr_depensier;
		let type_energie = enums.type_energie[fr.donnee_entree.enum_type_energie_id];
		if (type_energie === 'électricité') type_energie = 'électricité fr';
		return acc + getConso(coef, type_energie, conso);
	}, 0);

	let tot_aux;
	if (prefix === 'cout') tot_aux = 'total_auxiliaire';
	else tot_aux = 'totale_auxiliaire';
	ret[tot_aux] =
		ret.auxiliaire_ventilation +
		ret.auxiliaire_generation_ch +
		ret.auxiliaire_generation_ecs +
		ret.auxiliaire_distribution_ch +
		ret.auxiliaire_distribution_ecs;
	ret['5_usages'] = ret.ch + ret.ecs + ret.fr + ret[tot_aux] + ret.eclairage;
	if (prefix != 'cout') ret['5_usages_m2'] = Math.floor(ret['5_usages'] / Sh);

	// add prefix_ to all ret keys
	Object.keys(ret).forEach((key) => {
		ret[`${prefix}_${key}`] = ret[key];
		delete ret[key];
	});
	return ret;
}
