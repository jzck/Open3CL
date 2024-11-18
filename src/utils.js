import enums from './enums.js';
import tvs from './tv.js';
import _ from 'lodash';

export let bug_for_bug_compat = false;
export function set_bug_for_bug_compat() {
  bug_for_bug_compat = true;
}

export let tv_match_new_version = false;
export function set_tv_match_optimized_version() {
  tv_match_new_version = true;
}

export function unset_tv_match_optimized_version() {
  tv_match_new_version = false;
}

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

export function add_references(enveloppe) {
  let i = 0;
  for (const mur of enveloppe.mur_collection.mur || []) {
    if (!mur.donnee_entree.reference) {
      mur.donnee_entree.reference = `mur_${i}`;
    }
    i += 1;
  }
  i = 0;
  for (const ph of enveloppe.plancher_haut_collection.plancher_haut || []) {
    if (!ph.donnee_entree.reference) {
      ph.donnee_entree.reference = `plancher_haut_${i}`;
    }
    i += 1;
  }
  i = 0;
  for (const pb of enveloppe.plancher_bas_collection.plancher_bas || []) {
    if (!pb.donnee_entree.reference) {
      pb.donnee_entree.reference = `plancher_bas_${i}`;
    }
    i += 1;
  }
  i = 0;
  for (const bv of enveloppe.baie_vitree_collection.baie_vitree || []) {
    if (!bv.donnee_entree.reference) {
      bv.donnee_entree.reference = `baie_vitree_${i}`;
    }
    i += 1;
  }
  i = 0;
  for (const porte of enveloppe.porte_collection.porte || []) {
    if (!porte.donnee_entree.reference) {
      porte.donnee_entree.reference = `porte_${i}`;
    }
    i += 1;
  }
}

export function requestInputID(de, du, field, type) {
  // enums
  const enum_name = `enum_${field}_id`;
  if (type) du[enum_name] = type;
  else du[enum_name] = Object.keys(enums[field]);
  return de[enum_name];
}

export function requestInput(de, du, field, type) {
  if (enums.hasOwnProperty(field)) {
    // enums
    const enum_name = `enum_${field}_id`;
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
  const enum_name = `enum_${field}_id`;
  let ids = list.map((row) => row[enum_name]);
  // remove undefineds
  ids = ids.filter((id) => id);
  // split each by | and get uniques
  const unique_ids = [];
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
  const lines = [];
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
  if (tv_match_new_version) {
    return tvMatchOptimized(row, key, matcher);
  }
  if (!row.hasOwnProperty(key)) {
    // for empty csv columns
    // for q4pa_conv
    return false;
  }

  let match_value = String(matcher[key]).toLowerCase();

  // If the match value starts with ^, ends with $ and contains  + then we escape the +
  // Ex: ^iti+ite$ becomes ^iti\\+ite$
  if (/^\^(.*)\+(.*)\$$/g.test(match_value)) {
    match_value = match_value.replace('+', '\\+');
  }

  if (key.startsWith('enum_')) match_value = `^${String(matcher[key]).toLowerCase()}$`;

  if (row[key].includes('|')) {
    const values = row[key].split('|');
    if (!values.some((v) => v.toLowerCase().match(String(match_value)))) {
      return false;
    }
  } else if (Number.isInteger(match_value) && ['≥', '≤'].some((char) => row[key].includes(char))) {
    return eval(match_value + row[key].replace('≥', '>=').replace('≤', '<='));
  } else if (!row[key].toLowerCase().match(String(match_value))) {
    return false;
  }
  return true;
}

function tvMatchOptimized(row, key, matcher) {
  if (!row[key]) {
    // for empty csv columns
    // for q4pa_conv
    return false;
  }

  let row_value = row[key].toLowerCase();
  let match_value = String(matcher[key]).toLowerCase();

  if (row_value === match_value) {
    return true;
  }

  if (match_value.startsWith('^')) {
    const match_value_no_regex = match_value.replace('^', '').replace('$', '');
    if (row_value === match_value_no_regex) {
      return true;
    }
  }

  if (isNaN(matcher[key]) && row_value.includes(match_value)) {
    return true;
  }

  if (row_value.includes('|')) {
    return row_value.split('|').includes(match_value);
  }

  if (Number.isInteger(match_value) && ['≥', '≤'].some((char) => row[key].includes(char))) {
    return eval(match_value + row[key].replace('≥', '>=').replace('≤', '<='));
  }

  return row_value.includes(match_value);
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
    // if match_count is same as matcher, we are done
    if (match_count === Object.keys(matcher).length) return row;

    /* if (filePath === 'q4pa_conv') console.warn(match_count) */
    if (match_count > max_match_count) {
      max_match_count = match_count;
      match = row;
    }
  }
  /* if (filePath === 'pont_thermique') { */
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
  const collection_paths = [
    'logement.enveloppe.plancher_bas_collection.plancher_bas',
    'logement.enveloppe.plancher_haut_collection.plancher_haut',
    'logement.ventilation_collection.ventilation',
    'logement.climatisation_collection.climatisation',
    'logement.enveloppe.baie_vitree_collection.baie_vitree',
    'logement.enveloppe.porte_collection.porte',
    'logement.enveloppe.pont_thermique_collection.pont_thermique'
  ];
  for (const path of collection_paths) {
    if (!_.has(dpe_in, path)) {
      _.set(dpe_in, path, []);
    }
  }
}

/**
 * Retrieve a number describing a thickness from the description
 * @param description string in which to get the number
 * @returns {number} if found, 0 otherwise
 */
export function getThicknessFromDescription(description) {
  if (!description) {
    return 0;
  }

  const matching = description.match(/(\d+) cm/);
  return matching && matching.length > 1 ? Number.parseFloat(matching[1]) : 0;
}

/**
 * Return true si la collection $type peut être vide
 * - Pas de pont thermique ou pas de pont thermique de type enum_type_liaison_id
 * - Déperdition pour $type === 0 (donne probablement sur un autre local chauffé)
 * @param logement {Logement}
 * @param type {string}
 * @param enum_type_liaison_id {number}
 * @returns {boolean}
 */
export function collectionCanBeEmpty(logement, type, enum_type_liaison_id) {
  const pontsThermiques = logement.enveloppe.pont_thermique_collection.pont_thermique || [];

  const pontsThermiquesWithLiaison = pontsThermiques.filter(
    (pontThermique) => pontThermique.donnee_entree.enum_type_liaison_id === enum_type_liaison_id
  );

  const deperdition = logement.sortie.deperdition[`deperdition_${type}`];

  return pontsThermiquesWithLiaison.length === 0 && deperdition === 0;
}

/**
 * Retrieve a number describing a volume from the description
 * @param description string in which to get the number
 * @returns {number} if found, 0 otherwise
 */
export function getVolumeStockageFromDescription(description) {
  if (!description) {
    return 0;
  }

  const matching = description.split('contenance ballon ');
  return matching && matching.length > 1 ? parseInt(matching[1], 10) : 0;
}

/**
 * Remove space and accented characters
 * @param reference {string}
 * return {string}
 */
export function cleanReference(reference) {
  if (reference) {
    return reference
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
  }

  return reference;
}

/**
 * Return true if references are the same (without spaces and accented characters)
 * @param reference1 {string}
 * @param reference2 {string}
 * return {boolean}
 */
export function compareReferences(reference1, reference2) {
  return cleanReference(reference1) === cleanReference(reference2);
}

/**
 * Vérification si le chauffage est par effet joule
 * 3.2 Calcul des U des parois opaques
 * On considère qu’un logement est chauffé par effet joule lorsque la chaleur est fournie par une résistance électrique.
 * @param instal_ch {InstallationChauffageItem[]}
 * @returns {string} 1 if effet joule, 0 otherwise
 */
export function isEffetJoule(instal_ch) {
  const { surfaceEffetJoule, surfaceTotale } = instal_ch.reduce(
    (acc, item) => {
      const generatorIds = item.generateur_chauffage_collection.generateur_chauffage.reduce(
        (acc, generateur) => {
          return [...acc, generateur.donnee_entree.enum_type_generateur_ch_id];
        },
        []
      );

      /**
       * enum_type_generateur_ch_id
       * 98 - convecteur électrique nfc, nf** et nf***
       * 99 - panneau rayonnant électrique nfc, nf** et nf***
       * 100 - radiateur électrique nfc, nf** et nf***
       * 101 - autres émetteurs à effet joule
       * 102 - plancher ou plafond rayonnant électrique avec régulation terminale
       * 103 - plancher ou plafond rayonnant électrique sans régulation terminale
       * 104 - radiateur électrique à accumulation
       * 105 - convecteur bi-jonction
       * 106 - chaudière électrique
       * @type {boolean}
       */
      const isEffetJoule =
        generatorIds.filter((value) =>
          ['98', '99', '100', '101', '102', '103', '104', '105', '106'].includes(value)
        ).length > 0;

      if (isEffetJoule) {
        acc.surfaceEffetJoule += item.donnee_entree.surface_chauffee;
      }

      acc.surfaceTotale += item.donnee_entree.surface_chauffee;
      return acc;
    },
    { surfaceEffetJoule: 0, surfaceTotale: 0 }
  );

  // Si la surface chauffée par une résistance électrique est majoritaire => effet_joule = 1
  return surfaceEffetJoule / surfaceTotale >= 0.5 ? '1' : '0';
}
