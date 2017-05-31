/**
 * Import 16 file
 */

import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as fse from 'fs-extra';
import * as rimraf from 'rimraf';
import * as AdmZip from 'adm-zip';
import xlsx from 'node-xlsx';

import Knex = require('knex');

import { IZipEntry } from 'adm-zip';
import { unitOfTime } from 'moment';
import { ImportData } from './import';

export class Importor {

  uploadedPath = path.join(__dirname, process.env.UPLOADED_PATH);
  extractedPath = path.join(__dirname, process.env.EXTRACTED_PATH);
  importData: any;

  constructor() {
    this.importData = new ImportData();
  }

  doImportUCREPExcel(db: Knex, excelFile: string) {
    // var excelFile = './sample/eclaim_11053_IP_25600305_094434726.xls';
    const workSheetsFromFile = xlsx.parse(fs.readFileSync(excelFile));
    let totalData = +workSheetsFromFile[1].data[5][3];
    let totalAccept = +workSheetsFromFile[1].data[5][4];
    let startRecord = 0;

    // finding total records
    let total = workSheetsFromFile[0].data.length;
    for (let _i = 0; _i < 100; _i++) {
      let data = workSheetsFromFile[0].data[_i];
      if (data) {
        if (data.length) {
          let xstr: string = <string>data[0];
          if (xstr) {
            if (xstr.includes('REP')) {
              startRecord = _i + 3;
            }
          }
        }
      }
    }

    let stopRecord = startRecord + totalData;
    let sqls = [];

    // console.log('Start: ', startRecord);
    // console.log('Stop: ', stopRecord);

    for (let _i = startRecord; _i <= stopRecord - 1; _i++) {
      let data = workSheetsFromFile[0].data[_i];
      if (data) {
        let repNo = data[0];
        let tranId = data[2];
        let hn = data[3];
        let an = data[4];
        let serviceType = data[7];
        let serveDate = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        let serveTime = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        let dchDate = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        let dchTime = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        let charge1 = parseFloat(data[38]) || 0;
        let charge2 = parseFloat(data[39]) || 0;
        let chargeTotal = parseFloat(data[40]) || 0;
        let pay = parseFloat(data[42]) || 0;
        // console.log(data[40])
        let errorCode = data[13];
        let mainInscl = data[21];
        let subInscl = data[22];
        let lateCount = +data[44];
        let mainFund = data[14];
        let subFund = data[15];
        let typeClaim = data[16];

        // let drg = data[];
        // let rw = data[];

        let sql = `
          INSERT INTO eclaim_ucs
          (rep_no, tran_id, hn, an, service_type, date_serv, time_serv, date_dch, time_dch,
          charge1, charge2, charge_total, pay, error_code, late_count, main_inscl, sub_inscl,
          main_fund, sub_fund, type_claim)
          VALUES('${repNo}', '${tranId}', '${hn}', '${an}', '${serviceType}',
          '${serveDate}', '${serveTime}',
          '${dchDate}', '${dchTime}', ${charge1}, ${charge2}, ${chargeTotal}, ${pay}, '${errorCode}',
          ${lateCount}, '${mainInscl}', '${subInscl}', '${mainFund}', '${subFund}', '${typeClaim}')
          ON DUPLICATE KEY UPDATE
          date_serv='${serveDate}', time_serv='${serveTime}', date_dch='${dchDate}', time_dch='${dchTime}',
          charge1=${charge1}, charge2=${charge2}, charge_total=${chargeTotal}, pay=${pay},
          error_code='${errorCode}', late_count=${lateCount}, main_inscl='${mainInscl}', sub_inscl='${subInscl}'
        `;

        sqls.push(sql);
      }

    }
    let queries = sqls.join(';');
    // console.log(queries);
    return db.raw(queries);

  }

  doImportOFCREPExcel(db: Knex, excelFile: string) {
    // var excelFile = './sample/eclaim_11053_IP_25600305_094434726.xls';
    const workSheetsFromFile = xlsx.parse(fs.readFileSync(excelFile));
    let totalData = +workSheetsFromFile[1].data[5][3];
    let totalAccept = +workSheetsFromFile[1].data[5][4];
    let startRecord = 0;

    // finding total records
    let total = workSheetsFromFile[0].data.length;
    for (let _i = 0; _i < 100; _i++) {
      let data = workSheetsFromFile[0].data[_i];
      if (data) {
        if (data.length) {
          let xstr: string = <string>data[0];
          if (xstr) {
            if (xstr.includes('REP')) {
              startRecord = _i + 3;
            }
          }
        }
      }
    }

    let stopRecord = startRecord + totalData;
    let sqls = [];

    // console.log('Start: ', startRecord);
    // console.log('Stop: ', stopRecord);

    for (let _i = startRecord; _i <= stopRecord - 1; _i++) {
      let data = workSheetsFromFile[0].data[_i];
      if (data) {
        let repNo = data[0];
        let tranId = data[2];
        let hn = data[3];
        let an = data[4];
        let serviceType = data[7];
        let serveDate = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        let serveTime = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        let dchDate = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        let dchTime = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        let chargeNhso = parseFloat(data[10]) || 0;
        let chargeOther = parseFloat(data[11]) || 0;
        let totalCharged = parseFloat(data[39]) || 0;
        console.log('total_charged:', totalCharged);
        let pay = parseFloat(data[41]) || 0;
        console.log('pay:', pay);
        let errorCode = data[13];
        let mainInscl = data[21];
        let subInscl = data[22];
        let lateCount = +data[44];
        let mainFund = data[14];
        let subFund = data[15];
        let typeClaim = data[16];

        let sql = `
          INSERT INTO eclaim_data
          (rep_no, tran_id, hn, an, service_type, date_serv, time_serv, date_dch, time_dch,
          charge_nhso, charge_other, error_code, late_count, main_inscl, sub_inscl,
          main_fund, sub_fund, type_claim, total_charged, pay)
          VALUES('${repNo}', '${tranId}', '${hn}', '${an}', '${serviceType}',
          '${serveDate}', '${serveTime}',
          '${dchDate}', '${dchTime}', ${chargeNhso}, ${chargeOther}, '${errorCode}',
          ${lateCount}, '${mainInscl}', '${subInscl}', '${mainFund}', '${subFund}', '${typeClaim}', ${totalCharged}, ${pay})
          ON DUPLICATE KEY UPDATE
          date_serv='${serveDate}', time_serv='${serveTime}', date_dch='${dchDate}', time_dch='${dchTime}',
          charge_nhso=${chargeNhso}, charge_other=${chargeOther},
          error_code='${errorCode}', late_count=${lateCount}, main_inscl='${mainInscl}', sub_inscl='${subInscl}',
          total_charged=${totalCharged}, pay=${pay}
        `;

        sqls.push(sql);
      }

    }
    let queries = sqls.join(';');
    // console.log(queries);
    return db.raw(queries);

  }

  doImportREPEClaim(db: Knex, excelFile: string) {

    const workSheetsFromFile = xlsx.parse(fs.readFileSync(excelFile));
    let totalData = +workSheetsFromFile[1].data[5][3];
    let totalAccept = +workSheetsFromFile[1].data[5][4];

    let startRecord = 8;
    let stopRecord = startRecord + totalData;

    let datas = [];

    for (let _i = startRecord; _i < stopRecord; _i++) {
      let _data = workSheetsFromFile[0].data[_i];
    }

  }

  saveLogs(db: Knex, data) {
    return db('uploaded_logs')
      .insert(data);
  }

  getLogs(db: Knex) {
    return db('uploaded_logs')
      .orderBy('uploaded_at', 'DESC')
  }

  doImportF16(db: Knex, filePath: string) {
    return new Promise((resolve, reject) => {

      const ext = path.extname(filePath);

      if (ext.toLowerCase() === '.zip') {

        // extract file
        const zipFile = filePath;
        const zip = new AdmZip(zipFile);
        const zipEntries = zip.getEntries();

        let files = {
          pat: null,
          idx: null,
          ipd: null,
          opd: null,
          odx: null,
          adp: null,
          aer: null,
          cha: null,
          cht: null,
          dru: null,
          ins: null,
          iop: null,
          irf: null,
          lvd: null,
          oop: null,
          orf: null
        };
        // console.log(zipEntries);
        const tmpExtractedPath = path.join(this.extractedPath, moment().format('x'));
        fse.ensureDirSync(tmpExtractedPath);
        // do extract file .zip
        zip.extractAllTo(tmpExtractedPath, true);
        // get file list
        zipEntries.forEach((v: IZipEntry) => {
          let fileName = path.basename(v.entryName);
          let txtFile = path.extname(v.entryName);
          // console.log(fileName)
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'pat.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.pat = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'idx.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.idx = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'ipd.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.ipd = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'opd.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.opd = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'odx.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.odx = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'adp.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.adp = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'aer.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.aer = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'cha.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.cha = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'cht.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.cht = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'dru.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.dru = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'idx.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.idx = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'ins.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.ins = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'iop.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.iop = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'irf.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.irf = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'lvd.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.lvd = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'oop.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.oop = filePath
          }
          if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'orf.txt') {
            let filePath = path.join(tmpExtractedPath, v.entryName);
            files.orf = filePath
          }

        });

        this.importData.import16pat(db, files.pat)
          .then((results: any) => {
            return this.importData.import16ipd(db, files.ipd)
          })
          .then((results: any) => {
            return this.importData.import16idx(db, files.idx)
          })
          .then((results: any) => {
            return this.importData.import16opd(db, files.opd)
          })
          .then((results: any) => {
            return this.importData.import16odx(db, files.odx)
          })
          .then((results: any) => {
            return this.importData.import16aer(db, files.aer)
          })
          .then((results: any) => {
            return this.importData.import16cha(db, files.cha)
          })
          .then((results: any) => {
            return this.importData.import16cht(db, files.cht)
          })
          .then((results: any) => {
            return this.importData.import16dru(db, files.dru)
          })
          .then((results: any) => {
            return this.importData.import16ins(db, files.ins)
          })
          .then((results: any) => {
            return this.importData.import16iop(db, files.iop)
          })
          .then((results: any) => {
            return this.importData.import16lvd(db, files.lvd)
          })
          .then((results: any) => {
            return this.importData.import16irf(db, files.irf)
          })
          .then((results: any) => {
            return this.importData.import16oop(db, files.oop)
          })
          .then((results: any) => {
            return this.importData.import16orf(db, files.orf)
          })
          .then((results: any) => {
            // console.log(results.message);
            rimraf.sync(tmpExtractedPath);
            resolve();
            // db.destroy();
          })
          .catch((err) => {
            // db.destroy();
            console.log(err);
            reject(err)
          });
      } else {
        reject('รูปแบบไฟล์ไม่ถูกต้อง (.zip เท่านั้น)');
      }

    });
  }

}