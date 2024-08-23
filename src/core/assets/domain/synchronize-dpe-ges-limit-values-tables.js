import { set } from 'lodash-es';

const CLASSE_ALTITUDE_PROPERTY = 'classe_altitude';
const SURFACE_PROPERTY = 'surface';
const EXCLUDED_PROPERTIES = [CLASSE_ALTITUDE_PROPERTY, SURFACE_PROPERTY];

/**
 * Read the `dpe_ges_limit_values.ods` local file
 * - Convert the file into a json object
 * - Extract, format data and return data
 *
 *  The file content is merged in the `tv.js` file generated in the {@link SynchronizeValeurTables} use case.
 */
export class SynchronizeDpeGesLimitValuesTables {
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
   * @return {Promise<any>}
   */
  execute() {
    return this.#fileStore
      .readLocalOdsFileAndConvertToJson(this.#appConfig.dpeGesLimitValuesFilePath)
      .then(
        /** @param excelSheets {{[key: string]: {classe_altitude: string, surface: string}[]}} **/ (
          excelSheets
        ) => {
          const output = {};

          // For each tab in Excel file
          for (const sheetName in excelSheets) {
            output[sheetName] = {};

            excelSheets[sheetName].forEach((sheetValue) => {
              // Group by "classe_altitude" an "surface"
              let groupKey = sheetValue.classe_altitude;

              if (!output[sheetName][groupKey]) {
                output[sheetName][groupKey] = {};
              }

              output[sheetName][groupKey][parseFloat(sheetValue.surface)] = {};

              for (const sheetValueKey in sheetValue) {
                if (!EXCLUDED_PROPERTIES.includes(sheetValueKey)) {
                  const path = `${sheetName}.${groupKey}.${sheetValue.surface}.${sheetValueKey}`;
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
