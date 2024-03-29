import enums from './enums.js';
import calc_gen_ecs from './14_generateur_ecs.js';
import { tv, requestInput, requestInputID } from './utils.js';

function tv_rendement_distribution_ecs(di, de, du, pvc) {
	let matcher = {
		enum_type_installation_id: requestInputID(de, du, 'type_installation', ['1', '2'])
	};

	let type_installation = enums.type_installation[de.enum_type_installation_id];

	let configuration_logement;
	if (type_installation.includes('individuelle')) {
		if (pvc === 1)
			configuration_logement = 'production volume habitable [+] pièces alimentées contiguës';
		else configuration_logement = 'production hors volume habitable';
	} else if (type_installation.includes('collective')) {
		let type_reseau_collectif;
		configuration_logement = 'majorité des logements avec pièces alimentées contiguës';
		let isole = requestInput(de, du, 'reseau_distribution_isole', 'bool');
		if (isole === 0) {
			type_reseau_collectif = 'Réseau collectif non isolé';
		} else {
			let type_bouclage = requestInput(de, du, 'bouclage_reseau_ecs');
			if (type_bouclage === "réseau d'ecs bouclé") {
				type_reseau_collectif = 'Réseau collectif isolé bouclé';
				matcher;
			} else {
				configuration_logement = null;
				type_reseau_collectif =
					'Réseau collectif isolé avec traçage ou Réseau collectif isolé sans traçage ni bouclage';
			}
		}
		matcher.type_reseau_collectif = type_reseau_collectif;
	}
	if (configuration_logement) matcher.configuration_logement = configuration_logement;
	const row = tv('rendement_distribution_ecs', matcher, de);
	if (row) {
		di.rendement_distribution = Number(row.rd);
		de.tv_rendement_distribution_ecs_id = Number(row.tv_rendement_distribution_ecs_id);
	} else {
		console.error('!! pas de valeur forfaitaire trouvée pour rd !!');
	}
}

export default function calc_ecs(ecs, becs, becs_dep, GV, ca_id, zc_id) {
	let de = ecs.donnee_entree;
	let di = {};
	let du = {};

	di.besoin_ecs = becs;
	di.besoin_ecs_depensier = becs_dep;

	let pvc = ecs.generateur_ecs_collection.generateur_ecs[0].donnee_entree.position_volume_chauffe;
	tv_rendement_distribution_ecs(di, de, du, pvc);

	let gen_ecs_list = ecs.generateur_ecs_collection.generateur_ecs;
	gen_ecs_list.forEach((gen_ecs) => calc_gen_ecs(gen_ecs, di, GV, ca_id, zc_id));

	di.conso_ecs = gen_ecs_list.reduce(
		(acc, gen_ecs) => acc + gen_ecs.donnee_intermediaire.conso_ecs,
		0
	);
	di.conso_ecs_depensier = gen_ecs_list.reduce(
		(acc, gen_ecs) => acc + gen_ecs.donnee_intermediaire.conso_ecs_depensier,
		0
	);

	ecs.donnee_intermediaire = di;
	ecs.donnee_utilisateur = du;
}
