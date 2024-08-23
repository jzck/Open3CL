import { SynchronizeAssets } from './synchronize-assets.js';
import { SynchronizeEnumTables } from './synchronize-enum-tables.js';
import { SynchronizeValeurTables } from './synchronize-valeur-tables.js';
import { jest } from '@jest/globals';

describe('SynchronizeAssets unit tests', () => {
  it('should synchronize xlsx and ods files', () => {
    const synchronizeEnumTables = new SynchronizeEnumTables(null, null);
    const synchronizeValeurTables = new SynchronizeValeurTables(null, null, null);
    const synchronizeAssets = new SynchronizeAssets(synchronizeEnumTables, synchronizeValeurTables);

    jest.spyOn(console, 'log').mockReturnValue(null);
    jest.spyOn(synchronizeEnumTables, 'execute').mockResolvedValue({});
    jest.spyOn(synchronizeValeurTables, 'execute').mockResolvedValue({});

    return synchronizeAssets.execute().then(() => {
      expect(synchronizeEnumTables.execute).toHaveBeenCalled();
      expect(synchronizeValeurTables.execute).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });

  it('should log errors if synchronization has failed', () => {
    const synchronizeEnumTables = new SynchronizeEnumTables(null, null);
    const synchronizeValeurTables = new SynchronizeValeurTables(null, null, null);
    const synchronizeAssets = new SynchronizeAssets(synchronizeEnumTables, synchronizeValeurTables);

    jest.spyOn(console, 'error').mockReturnValue(null);
    jest.spyOn(synchronizeEnumTables, 'execute').mockResolvedValue({});
    jest.spyOn(synchronizeValeurTables, 'execute').mockRejectedValue(null);

    return synchronizeAssets.execute().catch((error) => {
      expect(error).toBeDefined();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
