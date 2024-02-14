import enums from './enums.js';
import tvs from './tv.js';
import _ from 'lodash';

export const Tbase = {
	'inférieur à 400m': {
		h1: -9.5,
		h2: -6.5,
		h3: -3.5
	},
	'400-800m': {
		h1: -11.5,
		h2: -8.5,
		h3: -5.5
	},
	'supérieur à 800m': {
		h1: -13.5,
		h2: -10.5,
		h3: -7.5
	}
};

export const Njj = {
	Janvier: 31,
	Février: 28,
	Mars: 31,
	Avril: 30,
	Mai: 31,
	Juin: 30,
	Juillet: 31,
	Aout: 31,
	Septembre: 30,
	Octobre: 31,
	Novembre: 30,
	Décembre: 24
};

// sum all Njj values
export const Njj_sum = Object.values(Njj).reduce((acc, val) => acc + val, 0);

export const mois_liste = [
	'Janvier',
	'Février',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juillet',
	'Aout',
	'Septembre',
	'Octobre',
	'Novembre',
	'Décembre'
];

export function requestInputID(de, du, field, type) {
	// enums
	let enum_name = `enum_${field}_id`;
	if (type) du[enum_name] = type;
	else du[enum_name] = Object.keys(enums[field]);
	return de[enum_name];
}

export function requestInput(de, du, field, type) {
	if (enums.hasOwnProperty(field)) {
		// enums
		let enum_name = `enum_${field}_id`;
		if (type) du[enum_name] = type;
		else du[enum_name] = Object.keys(enums[field]);
		return enums[field][de[enum_name]];
	} else {
		// not enums
		if (!type) {
			console.error(`requestInput: type is not defined for ${field}`);
			return null;
		}
		du[field] = type;
		return de[field];
	}
}

export function getKeyByValue(object, value) {
	return Object.keys(object).find((key) => object[key] === value);
}

export function tvColumnIDs(filePath, field) {
	const list = tvs[filePath];
	let enum_name = `enum_${field}_id`;
	let ids = list.map((row) => row[enum_name]);
	// remove undefineds
	ids = ids.filter((id) => id);
	// split each by | and get uniques
	let unique_ids = [];
	for (const id of ids) {
		const values = id.split('|');
		for (const value of values) {
			if (!unique_ids.includes(value)) unique_ids.push(value);
		}
	}
	// sort like numbers
	return unique_ids;
}

export function tvColumnLines(filePath, column, matcher) {
	const list = tvs[filePath];
	// find lines in list that match matcher
	let lines = [];
	for (const row of list) {
		let match = true;
		for (const key in matcher) {
			if (tvMatch(row, key, matcher) === false) {
				match = false;
				break;
			}
		}
		if (match) lines.push(row[column]);
	}
	return lines;
}

function tvMatch(row, key, matcher) {
	if (!row.hasOwnProperty(key)) {
		// empty csv columns
		return true;
	}

	let match_value = String(matcher[key]).toLowerCase();
	if (key.startsWith('enum_')) match_value = `^${String(matcher[key]).toLowerCase()}$`;

	if (row[key].includes('|')) {
		const values = row[key].split('|');
		if (!values.some((v) => v.toLowerCase().match(String(match_value)))) {
			return false;
		}
	} else if (!row[key].toLowerCase().match(String(match_value))) {
		return false;
	}
	return true;
}

export function tv(filePath, matcher) {
	const list = tvs[filePath];
	let match_count = 0;
	let max_match_count = 0;
	let match = null;

	for (const row of list) {
		match_count = 0;
		for (const key in matcher) {
			if (tvMatch(row, key, matcher)) match_count += 1;
		}
		if (match_count > max_match_count) {
			max_match_count = match_count;
			match = row;
		}
	}
	/* if (filePath === 'sw') { */
	/* 	console.warn(matcher) */
	/* 	console.warn(match) */
	/* } */
	return match;
}

export function removeKeyFromJSON(jsonObj, keyToRemove, skipKeys) {
	for (const key in jsonObj) {
		if (skipKeys.includes(key)) continue;
		if (jsonObj.hasOwnProperty(key)) {
			if (key === keyToRemove) {
				delete jsonObj[key];
			} else if (typeof jsonObj[key] === 'object') {
				removeKeyFromJSON(jsonObj[key], keyToRemove, skipKeys);
			}
		}
	}
}

export function clean_dpe(dpe_in) {
	// skip generateur_[ecs|chauffage] because some input data is contained in donnee_intermediaire (e.g. pn, qp0, ...)
	removeKeyFromJSON(dpe_in, 'donnee_intermediaire', ['generateur_ecs', 'generateur_chauffage']);
	_.set(dpe_in, 'logement.sortie', null);
}

export function sanitize_dpe(dpe_in) {
	let collection_paths = [
		'logement.ventilation_collection.ventilation',
		'logement.climatisation_collection.climatisation',
		'logement.enveloppe.porte_collection.porte'
		/* 'logement.enveloppe.pont_thermique_collection.pont_thermique' */
	];
	for (const path of collection_paths) {
		if (!_.has(dpe_in, path)) {
			_.set(dpe_in, path, []);
		}
	}
}
