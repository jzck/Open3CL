import enums from './enums.js'
import { getKeyByValue, requestInput } from './utils.js'

export default function calc_confort_ete(inertie_id, bv, ph) {
  const classe_inertie = enums.classe_inertie[inertie_id]

  let orientations = bv.reduce((acc, bv) => {
    let orientation = bv.donnee_entree.enum_orientation_id
    if (!acc.includes(orientation)) acc.push(orientation)
    return acc
  }, [])
  let aspect_traversant = orientations.length > 1 ? 1 : 0

  let isolation_toiture = ph.reduce((acc, ph) => {
    let de = ph.donnee_entree
    let du = ph.donnee_utilisateur
    let type_adjacence = requestInput(de, du, 'type_adjacence')
    if (type_adjacence === 'extérieur') {
      let type_isolation = requestInput(de, du, 'type_isolation')
      if (type_isolation === 'inconnu' || type_isolation === 'non isolé') return 0
    }
    return acc
  }, 1)

  let inertie_lourde = 0
  if (classe_inertie === 'lourde') inertie_lourde = 1
  if (classe_inertie === 'très lourde') inertie_lourde = 1

  // TODO use `presence_protection_solaire_exterieure` ??
  let protection_solaire_exterieure = bv.reduce((acc, bv) => {
    let de = bv.donnee_entree
    let du = bv.donnee_utilisateur
    let orientation = requestInput(de, du, 'orientation')
    if (orientation === 'nord') return acc
    let type_fermerture = requestInput(de, du, 'type_fermeture')
    if (type_fermerture === 'abscence de fermeture pour la baie vitrée') return 0
    return acc
  }, 1)

  let confort_ete = {
    inertie_lourde: inertie_lourde,
    aspect_traversant: aspect_traversant,
    isolation_toiture: isolation_toiture,
    protection_solaire_exterieure: protection_solaire_exterieure,
    brasseur_air: 0
  }

  let nv_bon =
    confort_ete.inertie_lourde + confort_ete.logement_traversant + confort_ete.brasseur_air
  let nv_confort_ete
  if (confort_ete.protection_solaire_exterieure === 0 || confort_ete.isolation_toiture === 0)
    nv_confort_ete = 'insuffisant'
  else if (nv_bon >= 2) nv_confort_ete = 'bon'
  else nv_confort_ete = 'moyen'

  confort_ete.enum_indicateur_confort_ete_id = getKeyByValue(
    enums.indicateur_confort_ete,
    nv_confort_ete
  )
  return confort_ete
}
