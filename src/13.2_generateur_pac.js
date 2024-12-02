/**
 * Pour les générateurs "Autre système thermodynamique", les calculs sont faits comme pour les 'cet sur air ambiant'
 * @param dpe {FullDpe}
 * @param de {Donnee_entree}
 * @param type {'ch' | 'ecs'}
 */
export function updateGenerateurPacs(dpe, de, type) {
  const periodeInstallation = de.enum_periode_installation_ecs_thermo_id;

  if (periodeInstallation) {
    const enumType = `enum_type_generateur_${type}_id`;
    let generateurId = de[enumType];

    if (type === 'ecs') {
      /**
       * enum_type_generateur_ecs_id
       * 82 - autre système thermodynamique électrique
       */
      if (generateurId === '82') {
        switch (periodeInstallation) {
          case '1':
            generateurId = '10';
            break;
          case '2':
            generateurId = '11';
            break;
          case '3':
            generateurId = '12';
            break;
        }
      }
    }

    de[enumType] = generateurId;
  }
}
