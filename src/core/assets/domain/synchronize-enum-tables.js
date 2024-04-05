import { diff } from 'deep-object-diff';
import enums from '../../../enums.js';

/**
 * Download and overwrites the enum tables xlsx file from the official ademe repository
 * Please see @link https://gitlab.com/observatoire-dpe/observatoire-dpe/-/tree/master
 * - Convert the file into a json object
 * - Extract, format data and then generate a new enum.js file
 */
export class SynchronizeEnumTables {
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
   * @return {Promise<void>}
   */
  async execute() {
    return await this.#fileStore
      .downloadXlsxFileAndConvertToJson(this.#appConfig.ademeEnumTablesFileUrl)
      .then(
        /** @param tabValues {{[tabName: string]: {id: string, lib: string}[]}} xlsx content file grouped by tab */
        (tabValues) => {
          /**
           * @type {TableEnum}
           */
          const enumsOutput = {};

          // for each tab in xlsx file
          Object.keys(tabValues)
            .filter((tabName) => tabName !== 'index') // Exclude first tab called "index"
            .forEach((tabName) => {
              /**
               * Each tab has a list of columns (A,B,C, etc...)
               * Keep only the two first columns for now for compatibility
               * @type {{id: string, lib: string}[]}
               */
              const enumTabValues = tabValues[tabName];

              const outputTabValues = {};

              /**
               * Convert object in the form of [{A: 1, B: "test"}, {A: 2, B: "test 2"}]
               * to {1: "test", 2: "test 2"}
               */
              enumTabValues.forEach((enumTabValue) => {
                outputTabValues[enumTabValue.id] = enumTabValue.lib.replace(/ :/g, ' :');
                if (tabName !== 'classe_etiquette') {
                  outputTabValues[enumTabValue.id] = outputTabValues[enumTabValue.id].toLowerCase();
                }
              });

              enumsOutput[tabName] = outputTabValues;
            });

          // Verify that the generated file has no diff with the legacy `enum.js` file
          const enumsDiff = diff(enums, enumsOutput);

          if (Object.keys(enumsDiff).length > 0) {
            console.error(enumsDiff);
            return Promise.reject(
              'Enums file from ademe repository is different from legacy file: enum.js'
            );
          }

          // Overwrite the enum.js file in filesystem
          return this.#fileStore.writeFileToLocalSystem(
            `${this.#appConfig.assetsOutputFolder}/enum.js`,
            `/** @type {TableEnum} **/\nexport default ${JSON.stringify(enumsOutput, null, 2)}`
          );
        }
      );
  }
}
