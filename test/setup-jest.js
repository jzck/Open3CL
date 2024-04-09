import { jest } from '@jest/globals';

global.jest = jest;

jest.unstable_mockModule('fs', () => ({
  readFile: (filePath, callback) => {
    callback(null, 'content');
  },
  writeFile: (filePath, content, opts, callback) => {
    callback();
  }
}));
