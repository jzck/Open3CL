import { FileStore } from './file.store.js';

global.fetch = jest.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1))
  })
);

describe('FileStore unit tests', () => {
  it('should be able to download and parse an xlsx file', () => {
    const fileStore = new FileStore();

    return fileStore.downloadXlsxFileAndConvertToJson('http://localhost:8080').then((output) => {
      expect(output).toEqual({ Sheet1: [] });
    });
  });

  it('should be able to read and parse local ods file', () => {
    const fileStore = new FileStore();

    return fileStore.readLocalOdsFileAndConvertToJson('file.ods').then((output) => {
      expect(output).toEqual({ Sheet1: [] });
    });
  });

  it('should write file to local system', () => {
    const fileStore = new FileStore();
    return fileStore.writeFileToLocalSystem('src/output.js', 'filecontent');
  });
});
