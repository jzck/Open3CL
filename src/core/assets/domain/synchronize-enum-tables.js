/**
 * Download the `enum_tables.xlsx` file from the official ademe repository and generates a new `enums.js` file
 * Please see @link https://gitlab.com/observatoire-dpe/observatoire-dpe/-/tree/master
 * - Convert the file into a json object
 * - Extract, format data and then generate a new enums.js file
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
  execute() {
    return this.#fileStore
      .downloadXlsxFileAndConvertToJson(this.#appConfig.ademeEnumTablesFileUrl)
      .then(
        /** @param excelSheets {{[tabName: string]: {id: string, lib: string}[]}} xlsx content file grouped by tab */
        (excelSheets) => {
          const enumsOutput = {};

          // for each tab in xlsx file
          Object.keys(excelSheets)
            .filter((sheetName) => sheetName !== 'index') // Exclude first tab called "index"
            .forEach((sheetName) => {
              /**
               * Each Excel sheet has a list of columns
               * Keep only the two first columns for now for compatibility with the legacy `enums.js` file
               * @type {{id: string, lib: string}[]}
               */
              const excelSheetValues = excelSheets[sheetName];

              const outputTabValues = {};

              /**
               * Convert object in the form of [{id: 1, lib: "test"}, {id: 2, lib: "test 2"}]
               * to {1: "test", 2: "test 2"}
               */
              excelSheetValues.forEach((excelSheetValue) => {
                outputTabValues[excelSheetValue.id] = excelSheetValue.lib.replace(/ :/g, ' :');

                // For compatibility with the legacy `enums.js` file, force the lowercase for
                // each value except the `classe_etiquette`
                if (sheetName !== 'classe_etiquette') {
                  outputTabValues[excelSheetValue.id] =
                    outputTabValues[excelSheetValue.id].toLowerCase();
                }
              });

              enumsOutput[sheetName] = outputTabValues;
            });

          // Overwrite the enums.js file in filesystem
          return this.#fileStore.writeFileToLocalSystem(
            `${this.#appConfig.assetsOutputFolder}/enums.js`,
            `/** @type {TableEnum} **/\nexport default ${JSON.stringify(enumsOutput, null, 2)}`
          );
        }
      );
  }
}
