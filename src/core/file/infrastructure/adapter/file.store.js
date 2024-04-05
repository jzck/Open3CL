import { writeFile, readFile } from 'fs';
import * as XLSX from 'xlsx';

export class FileStore {
  /**
   * Download a xlsx file and convert it to json
   *
   * @param url {string} url of the xlsx file to download and convert
   *
   * @return {Promise<any>}
   */
  async downloadXlsxFileAndConvertToJson(url) {
    const buffer = await fetch(url).then((res) => res.arrayBuffer());

    const wb = XLSX.read(buffer, { type: 'string', raw: false });

    const jsonOutput = {};
    wb.SheetNames.forEach((sheetName) => {
      jsonOutput[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { raw: false });
    });

    return Promise.resolve(jsonOutput);
  }

  async readLocalOdsFileAndConvertToJson(filePath) {
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }).then((fileContent) => {
      const wb = XLSX.read(fileContent, { type: 'buffer' });
      const jsonOutput = {};
      wb.SheetNames.forEach((sheetName) => {
        jsonOutput[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { raw: false });
      });
      return jsonOutput;
    });
  }

  /**
   * @param filePath {string}
   * @param content {string}
   * @return {Promise<void>}
   */
  async writeFileToLocalSystem(filePath, content) {
    return new Promise((resolve, reject) => {
      writeFile(filePath, content, { encoding: 'utf-8' }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
