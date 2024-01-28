import enums from './enums.js'
import b from './3.1_b.js'
import { tv, requestInput } from './utils.js'

function tv_uporte(di, de, du) {
  requestInput(de, du, 'type_porte')
  let matcher = {
    enum_type_porte_id: de.enum_type_porte_id
  }
  const row = tv('uporte', matcher)
  if (row) {
    di.uporte = Number(row.uporte)
    de.tv_uporte_id = Number(row.tv_uporte_id)
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour uporte !!')
  }
}

export default function calc_porte(porte, zc) {
  let de = porte.donnee_entree
  let di = {}
  let du = {}

  requestInput(de, du, 'surface_porte', 'float')

  b(di, de, du, zc)
  let methode_saisie_uporte = requestInput(de, du, 'methode_saisie_uporte')
  if (
    methode_saisie_uporte ===
    'valeur justifiée saisie à partir des documents justificatifs autorisés'
  )
    di.uporte = requestInput(de, du, 'uporte_saisi', 'float')
  else if (methode_saisie_uporte === 'valeur forfaitaire') tv_uporte(di, de, du)

  porte.donnee_utilisateur = du
  porte.donnee_intermediaire = di
}
