import { addedDiff, diff } from 'deep-object-diff';
import { tvs } from '../../../tv.js';
import { ObjectUtil } from '../../util/infrastructure/object-util.js';

/**
 * Download and overwrites the valeurs tables xlsx file from the official ademe repository
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
    return this.#fileStore
      .downloadXlsxFileAndConvertToJson(this.#appConfig.ademeValeurTablesFileUrl)
      .then(
        /** @param tabValues {TableValeur} xlsx content file grouped by tab */
        (tabValues) => {
          // transform json object to match actual `tv.js` file
          tabValues = ObjectUtil.deepObjectTransform(
            tabValues,
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

              // Reformat all number with only one decimal
              if (!isNaN(Number(value)) && value.endsWith('0') && value.includes('.')) {
                return `${Math.round(value * 10) / 10}`;
              }

              return value;
            }
          );

          // Some properties exist in the legacy `tv.js` file but not in the Excel file,
          // so we keep it to be compatible
          tabValues = Object.assign({}, tabValues, addedDiff(tabValues, tvs));
          const valeursDiff = diff(tvs, tabValues);

          if (Object.keys(valeursDiff).length > 0) {
            console.error(valeursDiff);
            return Promise.reject('Valeurs file from ademe repository is different from local one');
          }

          // Overwrite the enum.js file in filesystem
          return this.#fileStore.writeFileToLocalSystem(
            `${this.#appConfig.assetsOutputFolder}/tv.js`,
            `/** @type {TableValeur} **/\nexport const tvs = ${JSON.stringify(tabValues, null, 2)}`
          );
        }
      );
  }
}
