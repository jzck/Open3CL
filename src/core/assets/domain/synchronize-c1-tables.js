import { set } from 'lodash-es';

const ZONE_CLIMATIQUE_PROPERTY = 'zc';
const MOIS_PROPERTY = 'mois';
const EXCLUDED_PROPERTIES = [ZONE_CLIMATIQUE_PROPERTY, MOIS_PROPERTY];

/**
 * Read the `18.5_c1.ods` local file
 * - Convert the file into a json object
 * - Extract, format data and return data
 *
 *  The file content is merged in the `tv.js` file generated in the {@link SynchronizeValeurTables} use case.
 */
export class SynchronizeC1Tables {
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
   *
   * @return {Promise<any>}
   */
  execute() {
    return this.#fileStore.readLocalOdsFileAndConvertToJson(this.#appConfig.c1FilePath).then(
      /** @param excelSheets {{[key: string]: {zc: string, mois: string}[]}} **/ (excelSheets) => {
        const output = {};

        // For each tab in Excel file
        for (const sheetName in excelSheets) {
          output[sheetName] = {};

          excelSheets[sheetName].forEach((sheetValue) => {
            for (const sheetValueKey in sheetValue) {
              if (!EXCLUDED_PROPERTIES.includes(sheetValueKey)) {
                const path = `${sheetName}.${sheetValue.zc}.${sheetValue.mois}.${sheetValueKey}`;
                set(output, path, parseFloat(sheetValue[sheetValueKey]));
              }
            }
          });
        }

        return output;
      }
    );
  }
}
