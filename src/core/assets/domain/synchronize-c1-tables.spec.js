import { SynchronizeC1Tables } from './synchronize-c1-tables.js';
import { FileStore } from '../../file/infrastructure/adapter/file.store.js';
import { ApplicationConfig } from '../../conf/infrastructure/application.config.js';
import { C1TablesFixture } from '../../../../test/fixtures/core/assets/c1-tables.fixture.js';

describe('SynchronizeC1Tables unit tests', () => {
  it('should read and parse 18.5_c1.ods file', () => {
    const fileStore = new FileStore();
    const appConfig = new ApplicationConfig();
    const synchronizeC1Tables = new SynchronizeC1Tables(fileStore, appConfig);

    const c1Data = C1TablesFixture.aC1Example();
    jest.spyOn(fileStore, 'readLocalOdsFileAndConvertToJson').mockResolvedValue(c1Data);
    jest.spyOn(ApplicationConfig.prototype, 'c1FilePath', 'get').mockReturnValue('src/file.ods');

    return synchronizeC1Tables.execute().then((output) => {
      expect(fileStore.readLocalOdsFileAndConvertToJson).toHaveBeenCalled();
      expect(output).toMatchObject({
        c1: {
          h1a: {
            Janvier: {
              'sud sup75°': 1.0,
              'sud 25°-75°': 1.67
            },
            Février: {
              'sud sup75°': 1.0,
              'sud 25°-75°': 1.78
            }
          }
        }
      });
    });
  });
});
