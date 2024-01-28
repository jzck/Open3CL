#!/bin/env bun

import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

// read data from stdin
let data = fs.readFileSync(0, 'utf-8');

const options = {
  // We want to make sure collections of length 1 are still parsed as arrays
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    const collectionNames = [
      'mur', 'plancher_bas', 'plancher_haut',
      'baie_vitree', 'porte', 'pont_thermique',
      'ventilation', 'installation_ecs', 'generateur_ecs', 'climatisation',
      'installation_chauffage', 'generateur_chauffage', 'emetteur_chauffage',
      'sortie_par_energie'
    ]
    if (collectionNames.includes(name)) return true;
  },
  tagValueProcessor: (tagName, val) => {
    if (tagName.startsWith('enum_')) {
      // Preserve value as string for tags starting with "enum_"
      return null;
    }
    if (Number.isNaN(Number(val))) return val;
    return Number(val);
  }
}
const parser = new XMLParser(options);

let dpe_json = parser.parse(data).dpe;
console.log(JSON.stringify(dpe_json, null, 2));
