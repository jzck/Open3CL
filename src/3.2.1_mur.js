import enums from './enums.js'
import { tv, requestInput, requestInputID, getKeyByValue, bug_for_bug_compat } from './utils.js'
import b from './3.1_b.js'

const path = require('path')
const scriptName = path.basename(__filename)

function tv_umur0 (di, de, du) {
  const matcher = {
    enum_materiaux_structure_mur_id: de.enum_materiaux_structure_mur_id
  }
  if (!['1', '20'].includes(de.enum_materiaux_structure_mur_id)) {
    // 1: inconnu, 20: cloison de platree, pas concerné par les epaisseurs
    // TODO not float, get from csv
    matcher.epaisseur_structure = requestInput(de, du, 'epaisseur_structure', 'float')
    if (!matcher.epaisseur_structure) {
      // BUG: des fois, LICIEL omet le champ 'epaisseur_structure'
      // il faut aller le chercher dans description
      // if desc is "Mur en blocs de béton creux d'épaisseur ≥ 25 cm non isolé donnant sur l'extérieur"
      // retrive just "≥ 25" with a regex
      const desc = de.description
      matcher.epaisseur_structure = desc.match(/(\d+) cm/)[1]
    }
  }
  const row = tv('umur0', matcher, de)
  if (row) {
    di.umur0 = Number(row.umur0)
    de.tv_umur0_id = Number(row.tv_umur0_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour umur0 !!')
  }
}

function tv_umur (di, de, du, pc_id, zc, ej) {
  const matcher = {
    enum_periode_construction_id: pc_id,
    enum_zone_climatique_id: zc,
    effet_joule: ej
  }
  const row = tv('umur', matcher, de)
  if (row) {
    di.umur = Number(row.umur)
    de.tv_umur_id = Number(row.tv_umur_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour umur !!')
  }
}

function calc_umur0 (di, de, du) {
  const umur0_avant = di.umur0
  const methode_saisie_u0 = requestInput(de, du, 'methode_saisie_u0')
  switch (methode_saisie_u0) {
    case 'type de paroi inconnu (valeur par défaut)':
      de.enum_materiaux_structure_mur_id = getKeyByValue(enums.materiaux_structure_mur, 'inconnu')
      tv_umur0(di, de, du)
      break
    case 'déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire':
      requestInput(de, du, 'materiaux_structure_mur')
      tv_umur0(di, de, du)
      break
    case 'saisie direct u0 justifiée à partir des documents justificatifs autorisés':
    case "saisie direct u0 correspondant à la performance de la paroi avec son isolation antérieure iti (umur_iti) lorsqu'il y a une surisolation ite réalisée":
      di.umur0 = requestInput(de, du, 'umur0_saisi', 'float')
      break
    case 'u0 non saisi car le u est saisi connu et justifié.':
      break
    default:
      console.warn('methode_saisie_u0 inconnue:', methode_saisie_u0)
  }

  /* if (de.paroi_ancienne) { */
  /*   // BUG: certains DPE utilisent le champs "paroi_ancienne" au lieu de "enduit_isolant_paroi_ancienne" */
  /*   // 2187E0982013C: utilise paroi_ancienne mais a de l'enduit */
  /*   // 2287E1923356Q: utilise paroi_ancienne mais n'a pas d'enduit */
  /*   de.enduit_isolant_paroi_ancienne = de.paroi_ancienne */
  /* } */

  if (requestInput(de, du, 'enduit_isolant_paroi_ancienne', 'bool') === 1) {
    // cf 2287E2336469P
    if (umur0_avant === di.umur0) {
      console.warn(`BUG(${scriptName}) correction isolation pour parois anciennes pas appliqué`)
      if (bug_for_bug_compat) di.umur0 = umur0_avant
      else di.umur0 = 1 / (1 / di.umur0 + 0.7)
    } else {
      di.umur0 = 1 / (1 / di.umur0 + 0.7)
    }
  }

  const type_doublage = requestInput(de, du, 'type_doublage')
  switch (type_doublage) {
    case "doublage indéterminé ou lame d'air inf 15 mm":
      di.umur0 = 1 / (1 / di.umur0 + 0.1)
      break
    case "doublage indéterminé avec lame d'air sup 15 mm":
    case 'doublage connu (plâtre brique bois)':
      di.umur0 = 1 / (1 / di.umur0 + 0.21)
      break
  }
  di.umur0 = Math.min(2.5, di.umur0)
}

export default function calc_mur (mur, zc, pc_id, ej) {
  const de = mur.donnee_entree
  const du = {}
  const di = {}
  di.umur0 = mur.donnee_intermediaire.umur0 // pour comparaison

  requestInput(de, du, 'surface_paroi_totale', 'float')
  requestInput(de, du, 'orientation')

  b(di, de, du, zc)

  const methode_saisie_u = requestInput(de, du, 'methode_saisie_u')
  switch (methode_saisie_u) {
    case 'non isolé':
      calc_umur0(di, de, du)
      di.umur = Math.min(di.umur0, 2.5)
      break
    case 'epaisseur isolation saisie justifiée par mesure ou observation':
    case 'epaisseur isolation saisie justifiée à partir des documents justificatifs autorisés': {
      calc_umur0(di, de, du)
      const e = requestInput(de, du, 'epaisseur_isolation', 'int') * 0.01
      di.umur = 1 / (1 / Number(di.umur0) + e / 0.04)
      break
    }
    case "resistance isolation saisie justifiée observation de l'isolant installé et mesure de son épaisseur":
    case 'resistance isolation saisie justifiée  à partir des documents justificatifs autorisés': {
      calc_umur0(di, de, du)
      const r = requestInput(de, du, 'resistance_isolation', 'float')
      di.umur = 1 / (1 / Number(di.umur0) + r)
      break
    }
    case 'isolation inconnue  (table forfaitaire)':
      calc_umur0(di, de, du)
      tv_umur(di, de, du, pc_id, zc)
      di.umur = Math.min(di.umur, di.umur0)
      break
    case "année d'isolation différente de l'année de construction saisie justifiée (table forfaitaire)": {
      calc_umur0(di, de, du)
      const pi_id = requestInputID(de, du, 'periode_isolation')
      tv_umur(di, de, du, pi_id, zc, ej)
      di.umur = Math.min(di.umur, di.umur0)
      break
    }
    case 'année de construction saisie (table forfaitaire)': {
      calc_umur0(di, de, du)
      let pi_id = pc_id
      const pc = enums.periode_construction[pc_id]
      switch (pc) {
        case 'avant 1948':
        case '1948-1974':
          pi_id = getKeyByValue(enums.periode_isolation, '1975-1977')
          break
      }
      const tv_umur_avant = de.tv_umur_id
      tv_umur(di, de, du, pi_id, zc, ej)
      if (de.tv_umur_id != tv_umur_avant && pi_id != pc_id) {
        console.warn(
          `BUG(${scriptName}) Si année de construction <74 alors Année d'isolation=75-77 (3CL page 13)`
        )
        if (bug_for_bug_compat) tv_umur(di, de, du, pc_id, zc, ej)
      }
      di.umur = Math.min(di.umur, di.umur0)
      break
    }
    case 'saisie direct u justifiée  (à partir des documents justificatifs autorisés)':
    case 'saisie direct u depuis rset/rsee( etude rt2012/re2020)':
      di.umur = requestInput(de, du, 'umur_saisi', 'float')
      break
    default:
      console.warn('methode_saisie_u inconnue:', methode_saisie_u)
  }
  mur.donnee_utilisateur = du
  mur.donnee_intermediaire = di
}
