#!/bin/env bun

import * as fs from 'fs'
import * as path from 'path'

import enums from '../src/enums.js'
import { calcul_3cl } from '../src/engine.js'
import { clean_dpe } from '../src/utils.js'

const args = process.argv.slice(2)
let dpe_json_file = args[0]
fs.readFile(dpe_json_file, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  // json parse data
  let dpe_in = JSON.parse(data)

  if (dpe_in === undefined) {
    console.warn('DPE vide')
    return null
  }
  let modele = enums.modele_dpe[dpe_in.administratif.enum_modele_dpe_id]
  if (modele != 'dpe 3cl 2021 méthode logement') {
    console.error('Moteur dpe non implémenté pour le modèle: ' + modele)
  }

  clean_dpe(dpe_in)
  let dpe_out = calcul_3cl(dpe_in)
  // json dump dpe_out on stdout
  console.log(JSON.stringify(dpe_out, null, 2))
})
