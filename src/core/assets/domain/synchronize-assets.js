export class SynchronizeAssets {
  /**
   * @type {SynchronizeEnumTables}
   */
  #synchronizeEnumTables;

  /**
   * @type {SynchronizeValeurTables}
   */
  #synchronizeValeurTables;

  /**
   * @param synchronizeEnumTables {SynchronizeEnumTables}
   * @param synchronizeValeurTables {SynchronizeValeurTables}
   */
  constructor(synchronizeEnumTables, synchronizeValeurTables) {
    this.#synchronizeEnumTables = synchronizeEnumTables;
    this.#synchronizeValeurTables = synchronizeValeurTables;
  }

  execute() {
    return Promise.all([
      this.#synchronizeEnumTables.execute(),
      this.#synchronizeValeurTables.execute()
    ])
      .then(() => console.log('enum and valeur tables are synchronized successfully'))
      .catch((error) => console.error('Could not synchronize files', error));
  }
}
