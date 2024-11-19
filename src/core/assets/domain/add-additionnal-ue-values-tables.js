import { UPB_ADDITIONAL_VALUES } from '../../tv/infrastructure/assets/additional-ue-values.js';

/**
 * Add additional values for ue
 */
export class AddAdditionnalUeValuesTables {
  /**
   * @type {FileStore}
   */
  #fileStore;

  /**
   * @type {ApplicationConfig}
   */
  #appConfig;

  /**
   * @param fileStore {FileStore}
   * @param appConfig {ApplicationConfig}
   */
  constructor(fileStore, appConfig) {
    this.#fileStore = fileStore;
    this.#appConfig = appConfig;
  }

  /**
   * Ajout de valeurs supplémentaires pour le calcul du facteur Ue pour les déperditions plancher_bas
   * @param tableValues
   * @returns {*}
   */
  execute(tableValues) {
    UPB_ADDITIONAL_VALUES.forEach(
      ({
        type_adjacence_plancher,
        enum_type_adjacence_id,
        type_adjacence,
        enum_periode_construction_id,
        periode_construction,
        values
      }) => {
        const baseData = {
          type_adjacence_plancher,
          enum_type_adjacence_id,
          type_adjacence,
          enum_periode_construction_id,
          periode_construction
        };

        values.forEach(({ ue, '2s_p': key2SP, upb }) => {
          tableValues['ue'].push({ ...baseData, '2s_p': key2SP, upb, ue });
        });
      }
    );

    return tableValues;
  }
}
