import enums from './enums.js'
import { tv, requestInput, requestInputID } from './utils.js'
import { getKeyByValue } from './utils.js'

import b from './3.1_b.js'

function tv_umur0(di, de, du) {
  let matcher = {
    enum_materiaux_structure_mur_id: de.enum_materiaux_structure_mur_id
  }
  if (
    de.enum_materiaux_structure_mur_id != getKeyByValue(enums.materiaux_structure_mur, 'inconnu')
  ) {
    matcher.epaisseur_structure = requestInput(de, du, 'epaisseur_structure', 'float') // TODO not float, get from csv
  }
  const row = tv('umur0', matcher)
  if (row) {
    di.umur0 = Number(row.umur0)
    de.tv_umur0_id = Number(row.tv_umur0_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour umur0 !!')
  }
}

function tv_umur(di, de, pc_id, zc, ej) {
  let matcher = {
    enum_periode_construction_id: pc_id,
    enum_zone_climatique_id: zc,
    effet_joule: ej
  }
  const row = tv('umur', matcher)
  if (row) {
    di.umur = Number(row.umur)
    de.tv_umur_id = Number(row.tv_umur_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour umur !!')
  }
}

function calc_umur0(di, de, du) {
  let methode_saisie_u0 = requestInput(de, du, 'methode_saisie_u0')
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

  if (requestInput(de, du, 'enduit_isolant_paroi_ancienne', 'bool') === 1)
    di.umur0 = 1 / (1 / di.umur0 + 0.7)

  let type_doublage = requestInput(de, du, 'type_doublage')
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

export default function calc_mur(mur, zc, pc_id, ej) {
  let de = mur.donnee_entree
  let du = {}
  let di = {}

  requestInput(de, du, 'surface_paroi_totale', 'float')
  requestInput(de, du, 'orientation')

  b(di, de, du, zc)

  let methode_saisie_u = requestInput(de, du, 'methode_saisie_u')
  switch (methode_saisie_u) {
    case 'non isolé':
      calc_umur0(di, de, du)
      di.umur = Math.min(di.umur0, 2.5)
      break
    case 'epaisseur isolation saisie justifiée par mesure ou observation':
    case 'epaisseur isolation saisie justifiée à partir des documents justificatifs autorisés': {
      calc_umur0(di, de, du)
      let e = requestInput(de, du, 'epaisseur_isolation', 'int') * 0.01
      di.umur = 1 / (1 / Number(di.umur0) + e / 0.04)
      break
    }
    case "resistance isolation saisie justifiée observation de l'isolant installé et mesure de son épaisseur":
    case 'resistance isolation saisie justifiée  à partir des documents justificatifs autorisés': {
      calc_umur0(di, de, du)
      let r = requestInput(de, du, 'resistance_isolation', 'float')
      di.umur = 1 / (1 / Number(di.umur0) + r)
      break
    }
    case 'isolation inconnue  (table forfaitaire)':
      calc_umur0(di, de, du)
      tv_umur(di, de, pc_id, zc)
      di.umur = Math.min(di.umur, di.umur0)
      break
    case "année d'isolation différente de l'année de construction saisie justifiée (table forfaitaire)": {
      calc_umur0(di, de, du)
      let pi = requestInputID(de, du, 'periode_isolation')
      tv_umur(di, de, pi, zc, ej)
      di.umur = Math.min(di.umur, di.umur0)
      break
    }
    case 'année de construction saisie (table forfaitaire)': {
      /* var pi_id = pc_id */
      /* let pc = enums.periode_construction[pc_id]; */
      /* switch (pc) { */
      /*   case "avant 1948": */
      /*   case "1948-1974": */
      /*     pi_id = getKeyByValue(enums.periode_isolation, "1975-1977"); */
      /*     break; */
      /* } */
      calc_umur0(di, de, du)
      tv_umur(di, de, pc_id, zc, ej)
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
