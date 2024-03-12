import enums from './enums.js'
import b from './3.1_b.js'
import { bug_for_bug_compat } from './utils.js'
import { tv, requestInput, requestInputID, getKeyByValue } from './utils.js'
var path = require('path');

function tv_uph0(di, de, du) {
  requestInput(de, du, 'type_plancher_haut')
  let matcher = {
    enum_type_plancher_haut_id: de.enum_type_plancher_haut_id
  }
  const row = tv('uph0', matcher)
  if (row) {
    di.uph0 = Number(row.uph0)
    de.tv_uph0_id = Number(row.tv_uph0_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour uph0 !!')
  }
}

function tv_uph(di, de, du, pc_id, zc, ej) {
  let type_adjacence = requestInput(de, du, 'type_adjacence')
  let type_ph = requestInput(de, du, 'type_plancher_haut')
  let type_toiture
  if (type_adjacence != 'extérieur') {
    type_toiture = 'combles'
  } else {
    if (type_ph === 'combles aménagés sous rampant')
      type_toiture = 'combles'
    else
      type_toiture = 'terrasse'
  }
  let matcher = {
    enum_periode_construction_id: pc_id,
    enum_zone_climatique_id: zc,
    effet_joule: ej,
    type_toiture: type_toiture
  }
  const row = tv('uph', matcher)
  if (row) {
    di.uph = Number(row.uph)
    de.tv_uph_id = Number(row.tv_uph_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour uph !!')
  }
}

function calc_uph0(di, de, du) {
  let methode_saisie_u0 = requestInput(de, du, 'methode_saisie_u0')
  switch (methode_saisie_u0) {
    case 'type de paroi inconnu (valeur par défaut)':
    case 'déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire':
      tv_uph0(di, de, du)
      break
    case 'saisie direct u0 justifiée à partir des documents justificatifs autorisés':
    case "saisie direct u0 correspondant à la performance de la paroi avec son isolation antérieure iti (umur_iti) lorsqu'il y a une surisolation ite réalisée":
      di.uph0 = requestInput(de, du, 'uph0_saisi')
      break
    case 'u0 non saisi car le u est saisi connu et justifié.':
      break
    default:
      console.warn('methode_saisie_u0 inconnue:', methode_saisie_u)
  }
}

export default function calc_ph(ph, zc, pc_id, ej) {
  let de = ph.donnee_entree
  let du = {}
  let di = {}

  b(di, de, du, zc)

  let methode_saisie_u = requestInput(de, du, 'methode_saisie_u')

  switch (methode_saisie_u) {
    case 'non isolé':
      calc_uph0(di, de, du)
      di.uph = di.uph0
      break
    case 'epaisseur isolation saisie justifiée par mesure ou observation':
    case 'epaisseur isolation saisie justifiée à partir des documents justificatifs autorisés': {
      let e = requestInput(de, du, 'epaisseur_isolation', 'int') * 0.01
      calc_uph0(di, de, du)
      di.uph = 1 / (1 / di.uph0 + e / 0.04)
      break
    }
    case "resistance isolation saisie justifiée observation de l'isolant installé et mesure de son épaisseur":
    case 'resistance isolation saisie justifiée  à partir des documents justificatifs autorisés': {
      let r = requestInput(de, du, 'resistance_isolation', 'float')
      calc_uph0(di, de, du)
      di.uph = 1 / (1 / di.uph0 + r)
      break
    }
    case 'isolation inconnue  (table forfaitaire)':
    case "année d'isolation différente de l'année de construction saisie justifiée (table forfaitaire)":
      tv_uph(di, de, du, de.enum_periode_isolation_id, zc, ej)
      calc_uph0(di, de, du)
      di.uph = Math.min(di.uph, di.uph0)
      break
    case 'année de construction saisie (table forfaitaire)': {
      // i.e l'année d'isolation n'est pas connue
      var pi_id = pc_id
      let pc = enums.periode_construction[pc_id]
      switch (pc) {
        case 'avant 1948':
        case '1948-1974':
          pi_id = getKeyByValue(enums.periode_isolation, '1975-1977')
          break
      }
      calc_uph0(di, de, du)
      const tv_uph_avant = de.tv_uph_id
      tv_uph(di, de, du, pi_id, zc, ej)
      di.uph = Math.min(di.uph, di.uph0)
      if (de.tv_uph_id != tv_uph_avant && pi_id != pc_id) {
        var scriptName = path.basename(__filename);
        console.warn(`BUG(${scriptName}) Si année de construction <74 alors Année d'isolation=75-77 (3CL page 21)`)
        if (bug_for_bug_compat) tv_uph(di, de, du, pc_id, zc, ej)
      }
      di.uph = Math.min(di.uph, di.uph0)
      break
    }
    case 'saisie direct u justifiée  (à partir des documents justificatifs autorisés)':
    case 'saisie direct u depuis rset/rsee( etude rt2012/re2020)':
      di.uph = requestInput(de, du, 'uph_saisi')
      break
    default:
      console.warn('methode_saisie_u inconnue:', methode_saisie_u)
  }

  ph.donnee_utilisateur = du
  ph.donnee_intermediaire = di
}
