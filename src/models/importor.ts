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

  async doImportUCREPExcel(db: Knex, excelFile: string) {
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
      if (data && data[0]) {
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

        let hmain = data[25];
        let com1 = parseFloat(data[10]) || 0;
        let com2 = parseFloat(data[11]) || 0;
        let drg = data[35];
        let rw = parseFloat(data[36]) || 0;
        let adjrw = parseFloat(data[48]) || 0;
        let com_act = parseFloat(data[50]) || 0;

        let iphc = parseFloat(data[54]) || 0;
        let ophc = parseFloat(data[55]) || 0;
        let opae = parseFloat(data[56]) || 0;
        let ipnb = parseFloat(data[57]) || 0;
        let ipuc = parseFloat(data[58]) || 0;
        let ip3sss = parseFloat(data[59]) || 0;
        let ip7sss = parseFloat(data[60]) || 0;
        let carae = parseFloat(data[61]) || 0;
        let caref = parseFloat(data[62]) || 0;
        let opinst = parseFloat(data[63]) || 0;
        let inst = parseFloat(data[64]) || 0;
        let ipaer = parseFloat(data[65]) || 0;
        let ipinrgc = parseFloat(data[66]) || 0;
        let ipinrgr = parseFloat(data[67]) || 0;
        let ipinspsn = parseFloat(data[68]) || 0;
        let ipprcc = parseFloat(data[69]) || 0;
        let ipprcc_puc = parseFloat(data[70]) || 0;
        let ipbkk_inst = parseFloat(data[71]) || 0;
        let ip_ontop = parseFloat(data[72]) || 0;

        // let drg = data[];
        // let rw = data[];

        let sql = `
          INSERT INTO eclaim_ucs
          (rep_no, tran_id, hn, an, service_type, date_serv, time_serv, date_dch, time_dch,
          charge1, charge2, charge_total, pay, error_code, late_count, main_inscl, sub_inscl,
          hmain, main_fund, sub_fund, type_claim, com1, com2, drg, rw, adjrw, com_act,
          iphc, ophc, opae, ipnb, ipuc, ip3sss, ip7sss, carae, caref, opinst, inst, ipaer,
          ipinrgc, ipinrgr, ipinspsn, ipprcc, ipprcc_puc, ipbkk_inst, ip_ontop)
          VALUES('${repNo}', '${tranId}', '${hn}', '${an}', '${serviceType}',
          '${serveDate}', '${serveTime}',
          '${dchDate}', '${dchTime}', ${charge1}, ${charge2}, ${chargeTotal}, ${pay}, '${errorCode}',
          ${lateCount}, '${mainInscl}', '${subInscl}', '${hmain}', '${mainFund}', '${subFund}', '${typeClaim}',
          ${com1}, ${com2}, '${drg}', ${rw}, ${adjrw}, ${com_act}, ${iphc},
          ${ophc}, ${opae}, ${ipnb}, ${ipuc}, ${ip3sss}, ${ip7sss}, ${carae}, ${caref}, ${opinst},
          ${inst}, ${ipaer}, ${ipinrgc}, ${ipinrgr}, ${ipinspsn}, ${ipprcc}, ${ipprcc_puc}, ${ipbkk_inst},
          ${ip_ontop})
          ON DUPLICATE KEY UPDATE
          date_serv='${serveDate}', time_serv='${serveTime}', date_dch='${dchDate}', time_dch='${dchTime}',
          charge1=${charge1}, charge2=${charge2}, charge_total=${chargeTotal}, pay=${pay},
          error_code='${errorCode}', late_count=${lateCount}, main_inscl='${mainInscl}', sub_inscl='${subInscl}',
          hmain='${hmain}', com1=${com1}, com2=${com2},
          drg='${drg}', rw=${rw}, adjrw=${adjrw}, com_act=${com_act}, iphc=${iphc},
          ophc=${ophc}, opae=${opae}, ipnb=${ipnb}, ipuc=${ipuc}, ip3sss=${ip3sss}, ip7sss=${ip7sss}, carae=${carae}, caref=${caref}, opinst=${opinst},
          inst=${inst}, ipaer=${ipaer}, ipinrgc=${ipinrgc}, ipinrgr=${ipinrgr}, ipinspsn=${ipinspsn}, 
          ipprcc=${ipprcc}, ipprcc_puc=${ipprcc_puc}, ipbkk_inst=${ipbkk_inst}, ip_ontop=${ip_ontop}
        `;

        sqls.push(sql);
      }

    }
    let queries = sqls.join(';');
    // console.log(queries);
    const results = await db.raw(queries);
    return results;

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
              startRecord = _i + 2;
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
      if (data && data[0]) {
        // console.log(data);

        let repNo = data[0];
        let tranId = data[2];
        let hn = data[3];
        let an = data[4];
        let serviceType = data[7];
        let serveDate = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        let serveTime = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        let dchDate = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        let dchTime = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        // console.log(data[40])
        let errorCode = data[12];
        let mainInscl = data[18];
        let subInscl = data[19];
        let lateCount = +data[35];
        let mainFund = data[13];
        // let subFund = data[15];
        let typeClaim = data[14];

        let hmain = data[23];

        let charge1 = parseFloat(data[29]) || 0;
        let charge2 = parseFloat(data[30]) || 0;
        let chargeTotal = (charge1 + charge2) || 0;
        // let chargeTotal = 0;
        let pay = parseFloat(data[33]) || 0;
        let com1 = parseFloat(data[10]) || 0;
        let com2 = parseFloat(data[11]) || 0;
        let com_act = parseFloat(data[39]) || 0;
        let drg = parseFloat(data[27]) || 0;
        let rw = parseFloat(data[28]) || 0;
        let adjrw = parseFloat(data[38]) || 0;

        let reimbursement = parseFloat(data[31]) || 0;
        let noneReimbursement = parseFloat(data[32]) || 0;

        let ipcs = parseFloat(data[40]) || 0;
        let ipcs_ors = parseFloat(data[41]) || 0;
        let opcs = parseFloat(data[42]) || 0;
        let pacs = parseFloat(data[43]) || 0;
        let instcs = parseFloat(data[44]) || 0;
        let otcs = parseFloat(data[45]) || 0;
        let fpnhso = parseFloat(data[46]) || 0;
        let drug = parseFloat(data[47]) || 0;

        // let drg = data[];
        // let rw = data[];

        let sql = `
          INSERT INTO eclaim_ofc
          (rep_no, tran_id, hn, an, service_type, date_serv, time_serv, date_dch, time_dch,
          charge1, charge2, charge_total, pay, error_code, late_count, main_inscl, sub_inscl,
          hmain, main_fund, type_claim, com1, com2, com_act, drg, rw, adjrw, reimbursement,
          none_reimbursement, ipcs, ipcs_ors, opcs, pacs, instcs, otcs, fpnhso, drug)
          VALUES('${repNo}', '${tranId}', '${hn}', '${an}', '${serviceType}',
          '${serveDate}', '${serveTime}',
          '${dchDate}', '${dchTime}', ${charge1}, ${charge2}, ${chargeTotal}, ${pay}, '${errorCode}',
          ${lateCount}, '${mainInscl}', '${subInscl}', '${hmain}', '${mainFund}', '${typeClaim}',
          ${com1}, ${com2}, ${com_act}, '${drg}', ${rw}, ${adjrw}, ${reimbursement}, ${noneReimbursement},
          ${ipcs}, ${ipcs_ors}, ${opcs}, ${pacs}, ${instcs}, ${otcs}, ${fpnhso}, ${drug})
          ON DUPLICATE KEY UPDATE
          date_serv='${serveDate}', time_serv='${serveTime}', date_dch='${dchDate}', time_dch='${dchTime}',
          charge1=${charge1}, charge2=${charge2}, charge_total=${chargeTotal}, pay=${pay},
          error_code='${errorCode}', late_count=${lateCount}, main_inscl='${mainInscl}', sub_inscl='${subInscl}',
          hmain='${hmain}', com1=${com1}, com2=${com2}, com_act=${com_act},
          drg='${drg}', rw=${rw}, adjrw=${adjrw}, reimbursement=${reimbursement},
          none_reimbursement=${noneReimbursement}, ipcs=${ipcs}, ipcs_ors=${ipcs_ors},
          opcs=${opcs}, pacs=${pacs}, instcs=${instcs}, otcs=${otcs}, fpnhso=${fpnhso},
          drug=${drug}
        `;

        sqls.push(sql);
      }

    }
    let queries = sqls.join(';');
    // fse.writeFileSync('./sql.txt', queries);
    return db.raw(queries);

  }

  doImportSSSREPText(db: Knex, zipFile: string) {

    let txtFile = null;
    const zip = new AdmZip(zipFile);
    const zipEntries = zip.getEntries();

    const tmpExtractedPath = path.join(this.extractedPath, moment().format('x'));

    fse.ensureDirSync(tmpExtractedPath);
    // do extract file .zip
    zip.extractAllTo(tmpExtractedPath, true);

    let sqls = [];

    zipEntries.forEach((v: IZipEntry) => {
      let fileName = path.basename(v.entryName);
      let txtFile = path.extname(v.entryName);
      // console.log(fileName)
      if (!_.startsWith(fileName, '.') && txtFile.toUpperCase() === '.REP') {
        txtFile = path.join(tmpExtractedPath, v.entryName);
      }

      let data = fse.readFileSync(txtFile);
      let _data = data.toString();
      let rows = _data.split('\n');
      let dataSSS = [];
      rows.forEach(v => {
        if (v.substr(0, 2) === '*|') {
          // *| 0 A S 600000686, 18532, ( 0.7538)  0.7538, Y, ทรงศักดิ์ เนื่องมหา
          let a = v.split(',');
          let pcode;
          let tcode;
          let iptype;
          let an;
          let drg = a[1];
          let is_sss = a[3];
          let name = a[4];

          let b = a[0].split(' ');
          pcode = b[1];
          tcode = b[2];
          iptype = b[3];
          an = b[4];
          // RW, DRG, ADJRW
          let c = a[2].split(' ');
          let adjrw = c[c.length - 1];

          let obj = {
            pcode: pcode,
            tcode: tcode,
            iptype: iptype,
            an: an,
            drg: drg,
            adjrw: parseFloat(adjrw) || 0,
            is_sss: is_sss
          }
          dataSSS.push(obj);
        }
      });

      dataSSS.forEach(v => {
        console.log(v);
        let sql = `
          INSERT INTO eclaim_sss
          (pcode, tcode, iptype, an, drg, adjrw, is_sss)
          VALUES('${v.pcode}', '${v.tcode}', '${v.iptype}', '${v.an}', '${v.drg}',
          ${v.adjrw}, '${v.is_sss}')
          ON DUPLICATE KEY UPDATE
          pcode='${v.pcode}', tcode='${v.tcode}', iptype='${v.iptype}',
          drg='${v.drg}', adjrw=${v.adjrw}, is_sss='${v.is_sss}'
        `;

        sqls.push(sql);
      })
    });

    rimraf.sync(tmpExtractedPath);
    let queries = sqls.join(';');
    return db.raw(queries);

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