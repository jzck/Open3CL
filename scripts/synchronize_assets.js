import { SynchronizeAssets } from '../src/core/assets/domain/synchronize-assets.js';
import { ApplicationConfig } from '../src/core/conf/infrastructure/application.config.js';
import { SynchronizeEnumTables } from '../src/core/assets/domain/synchronize-enum-tables.js';
import { FileStore } from '../src/core/file/infrastructure/adapter/file.store.js';
import { SynchronizeValeurTables } from '../src/core/assets/domain/synchronize-valeur-tables.js';

const fileStore = new FileStore();
const appConfig = new ApplicationConfig();
const synchronizeEnumTables = new SynchronizeEnumTables(fileStore, appConfig);
const synchronizeValeurTables = new SynchronizeValeurTables(fileStore, appConfig);
const synchronizeAssets = new SynchronizeAssets(synchronizeEnumTables, synchronizeValeurTables);

await synchronizeAssets.execute();
