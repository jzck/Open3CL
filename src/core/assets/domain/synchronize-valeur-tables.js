import { ObjectUtil } from '../../util/infrastructure/object-util.js';

/**
 * Download the `valeur_tables.xlsx` file from the official ademe repository and generates a new `enums.js` file
 * Please see @link https://gitlab.com/observatoire-dpe/observatoire-dpe/-/tree/master
 * - Convert the file into a json object
 * - Extract, format data and then generate a new tv.js file
 */
export class SynchronizeValeurTables {
  /**
   * @type {FileStore}
   */
  #fileStore;

  /**
   * @type {ApplicationConfig}
   */
  #appConfig;

  /**
   * @type {SynchronizeSolicitationsTables}
   */
  #synchronizeSolicitationsTables;

  /**
   * @type {SynchronizeDpeGesLimitValuesTables}
   */
  #synchronizeDpeGesLimitValuesTables;

  /**
   * @type {SynchronizeC1Tables}
   */
  #synchronizeC1Tables;

  /**
   * @param fileStore {FileStore}
   * @param appConfig {ApplicationConfig}
   * @param synchronizeSolicitationsTables {SynchronizeSolicitationsTables}
   * @param synchronizeDpeGesLimitValuesTables {SynchronizeDpeGesLimitValuesTables}
   * @param synchronizeC1Tables {SynchronizeC1Tables}
   */
  constructor(
    fileStore,
    appConfig,
    synchronizeSolicitationsTables,
    synchronizeDpeGesLimitValuesTables,
    synchronizeC1Tables
  ) {
    this.#fileStore = fileStore;
    this.#appConfig = appConfig;
    this.#synchronizeSolicitationsTables = synchronizeSolicitationsTables;
    this.#synchronizeDpeGesLimitValuesTables = synchronizeDpeGesLimitValuesTables;
    this.#synchronizeC1Tables = synchronizeC1Tables;
  }

  /**
   * @return {Promise<void>}
   */
  execute() {
    return this.#fileStore
      .downloadXlsxFileAndConvertToJson(this.#appConfig.ademeValeurTablesFileUrl)
      .then(
        /** @param excelSheets {any} xlsx content file grouped by tab */
        (excelSheets) => {
          // transform Excel sheets to match actual `tv.js` file
          excelSheets = ObjectUtil.deepObjectTransform(
            excelSheets,
            (key) => {
              if (key.includes('ditribution')) {
                // Fix typo in xlsx file
                return key.replace('ditribution', 'distribution');
              }
              return key;
            },
            (value, key) => {
              if (typeof value === 'string') {
                // ALl value that ends with '%' are replace by value to be compatible with the legacy `tv.js` file
                if (value.endsWith('%')) {
                  return `${parseFloat(value.replace('%', '')) / 100}`;
                }
                // Remove 'kW' to be compatible with the legacy `tv.js` file
                if (value.endsWith('kW')) {
                  return value.replace(/kW/g, '').replace(/\s/g, '');
                }
              }

              // By default, the Excel parsing ignore property with 0 value,
              // so we force it to be compatible with the legacy `tv.js` file
              if (key === 'q4pa_conv' && Array.isArray(value)) {
                return value.map((v) => {
                  if (!v.isolation_surfaces) {
                    v.isolation_surfaces = '0';
                  }
                  return v;
                });
              }

              // Reformat all number with only one decimal to be compatible with the legacy `tv.js` file
              if (!isNaN(Number(value)) && value.endsWith('0') && value.includes('.')) {
                return `${Math.round(value * 10) / 10}`;
              }

              return value;
            }
          );

          return excelSheets;
        }
      )
      .then((valeurTablesValues) => {
        return Promise.all([
          this.#synchronizeSolicitationsTables.execute(),
          this.#synchronizeDpeGesLimitValuesTables.execute(),
          this.#synchronizeC1Tables.execute()
        ]).then((tablesValues) => {
          const solicitationsTablesValues = tablesValues[0];
          const c1TablesValues = tablesValues[1];

          // Merge content from "valeur_tables.xlsx" file with "18.2_sollicitations_ext.ods" file
          const tableValues = Object.assign(
            {},
            valeurTablesValues,
            solicitationsTablesValues,
            c1TablesValues
          );

          // Overwrite the enum.js file in filesystem
          return this.#fileStore.writeFileToLocalSystem(
            `${this.#appConfig.assetsOutputFolder}/tv.js`,
            `/** @type {TableValeur} **/\nexport const tvs = ${JSON.stringify(tableValues, null, 2)}`
          );
        });
      });
  }
}
