import { SynchronizeValeurTables } from './synchronize-valeur-tables.js';
import { FileStore } from '../../file/infrastructure/adapter/file.store.js';
import { ApplicationConfig } from '../../conf/infrastructure/application.config.js';
import { SynchronizeC1Tables } from './synchronize-c1-tables.js';
import { SynchronizeSolicitationsTables } from './synchronize-solicitations-tables.js';
import { ValeurTablesFixture } from '../../../../test/fixtures/core/assets/valeur-tables.fixture.js';

describe('SynchronizeValeurTables unit tests', () => {
  it('should download, parse and convert valeur_tables.xlsx file', () => {
    const fileStore = new FileStore();
    const appConfig = new ApplicationConfig();
    const synchronizeC1Tables = new SynchronizeC1Tables(null, null);
    const synchronizeSolicitationTables = new SynchronizeSolicitationsTables(null, null);
    const synchronizeValeurTables = new SynchronizeValeurTables(
      fileStore,
      appConfig,
      synchronizeSolicitationTables,
      synchronizeC1Tables
    );

    const valeurTablesData = ValeurTablesFixture.aValeurTableExample();
    jest
      .spyOn(ApplicationConfig.prototype, 'ademeValeurTablesFileUrl', 'get')
      .mockReturnValue('http://localhost/file.xlsx');
    jest
      .spyOn(ApplicationConfig.prototype, 'assetsOutputFolder', 'get')
      .mockReturnValue('src/assets');

    jest.spyOn(fileStore, 'downloadXlsxFileAndConvertToJson').mockResolvedValue(valeurTablesData);
    jest.spyOn(fileStore, 'writeFileToLocalSystem').mockResolvedValue(null);
    jest.spyOn(synchronizeC1Tables, 'execute').mockResolvedValue({});
    jest.spyOn(synchronizeSolicitationTables, 'execute').mockResolvedValue({});

    return synchronizeValeurTables.execute().then(() => {
      expect(fileStore.downloadXlsxFileAndConvertToJson).toHaveBeenCalled();
      expect(fileStore.writeFileToLocalSystem).toHaveBeenCalledWith(
        'src/assets/tv.js',
        expect.any(String)
      );
    });
  });
});
