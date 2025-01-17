import { set } from 'lodash-es';

const ILPA_PROPERTY = 'ilpa';
const CLASSE_ALTITUDE_PROPERTY = 'classe_altitude';
const MOIS_PROPERTY = 'mois';
const EXCLUDED_PROPERTIES = [ILPA_PROPERTY, CLASSE_ALTITUDE_PROPERTY, MOIS_PROPERTY];

/**
 * Read the `18.2_sollicitations_ext.ods` local file
 * - Convert the file into a json object
 * - Extract, format data and return data
 *
 *  The file content is merged in the `tv.js` file generated in the {@link SynchronizeValeurTables} use case.
 */
export class SynchronizeSolicitationsTables {
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
      .readLocalOdsFileAndConvertToJson(this.#appConfig.solicitationsExtFilePath)
      .then(
        /** @param excelSheets {{[key: string]: {ilpa?: number, classe_altitude: string, mois: string}[]}} **/ (
          excelSheets
        ) => {
          const output = {};

          // For each tab in Excel file
          for (const sheetName in excelSheets) {
            output[sheetName] = {};

            excelSheets[sheetName].forEach((sheetValue) => {
              // Group by "ilpa" property if it exists or "classe_altitude" otherwise
              let groupKey = sheetValue.hasOwnProperty(ILPA_PROPERTY)
                ? '.' + sheetValue.ilpa
                : sheetValue.hasOwnProperty(CLASSE_ALTITUDE_PROPERTY)
                  ? '.' + sheetValue.classe_altitude
                  : '';

              for (const sheetValueKey in sheetValue) {
                if (!EXCLUDED_PROPERTIES.includes(sheetValueKey)) {
                  const path = `${sheetName}${groupKey}${sheetValue.hasOwnProperty(ILPA_PROPERTY) ? '.' + sheetValue.classe_altitude : ''}.${sheetValue.mois}.${sheetValueKey}`;
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
