import enums from './enums.js';

export default function rendement_distribution_ecs(ecs) {
  const de = ecs.donnee_entree;

  const type_installation = enums.type_installation[de.enum_type_installation_id];

  switch (type_installation) {
    case 'installation individuelle':
    default:
  }
}
