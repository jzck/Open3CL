import { FileStore } from '../../file/infrastructure/adapter/file.store.js';
import { ApplicationConfig } from '../../conf/infrastructure/application.config.js';
import { DpeGesLimitValuesTablesFixture } from '../../../../test/fixtures/core/assets/dpe-ges-limit-values-tables.fixture.js';
import { SynchronizeDpeGesLimitValuesTables } from './synchronize-dpe-ges-limit-values-tables.js';
import { jest } from '@jest/globals';

describe('SynchronizeDpeGesLimitValuesTables unit tests', () => {
  it('should read and parse dpe_ges_limit_values file', () => {
    const fileStore = new FileStore();
    const appConfig = new ApplicationConfig();
    const synchronizeDpeGesLimitValuesTables = new SynchronizeDpeGesLimitValuesTables(
      fileStore,
      appConfig
    );

    const dpeGesLimitData = DpeGesLimitValuesTablesFixture.aDpeGesLimitExample();
    jest.spyOn(fileStore, 'readLocalOdsFileAndConvertToJson').mockResolvedValue(dpeGesLimitData);
    jest
      .spyOn(ApplicationConfig.prototype, 'solicitationsExtFilePath', 'get')
      .mockReturnValue('src/file.ods');

    return synchronizeDpeGesLimitValuesTables.execute().then((output) => {
      expect(fileStore.readLocalOdsFileAndConvertToJson).toHaveBeenCalled();
      expect(output).toStrictEqual({
        dpe_class_limit: {
          'inférieur à 400m': {
            3: {
              A: 146,
              B: 186,
              C: 386,
              D: 505,
              E: 622,
              F: 739
            }
          },
          '400-800m': {
            10: {
              A: 124,
              B: 164,
              C: 329,
              D: 428,
              E: 533,
              F: 640
            }
          }
        },
        ges_class_limit: {
          '400-800m': {
            10: {
              A: 10,
              B: 15,
              C: 40,
              D: 62,
              E: 84,
              F: 115
            }
          },
          'inférieur à 400m': {
            3: {
              A: 11,
              B: 16,
              C: 44,
              D: 68,
              E: 90,
              F: 122
            }
          }
        }
      });
    });
  });
});
