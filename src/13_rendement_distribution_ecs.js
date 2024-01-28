import enums from './enums.js'

export default function rendement_distribution_ecs(ecs) {
  let de = ecs.donnee_entree
  let di = ecs.donnee_intermediaire

  let type_installation = enums.type_installation[de.enum_type_installation_id]

  switch (type_installation) {
    case 'installation individuelle':
    default:
  }
}
