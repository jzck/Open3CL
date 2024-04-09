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
    return fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buffer) =>
        this.#excelWorkBookToJson(XLSX.read(buffer, { type: 'string', raw: false }))
      );
  }

  readLocalOdsFileAndConvertToJson(filePath) {
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }).then((fileContent) =>
      this.#excelWorkBookToJson(XLSX.read(fileContent, { type: 'buffer', raw: false }))
    );
  }

  /**
   * @param filePath {string}
   * @param content {string}
   * @return {Promise<void>}
   */
  writeFileToLocalSystem(filePath, content) {
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

  #excelWorkBookToJson(workBook) {
    const jsonOutput = {};
    workBook.SheetNames.forEach((sheetName) => {
      jsonOutput[sheetName] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName], { raw: false });
    });
    return jsonOutput;
  }
}
