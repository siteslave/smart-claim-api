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
import Finder = require('fs-finder');

import Knex = require('knex');

import { IZipEntry } from 'adm-zip';
import { unitOfTime } from 'moment';
import { ImportData } from './import';

const importData = new ImportData();

const uploadedPath = process.env.UPLOADED_PATH
const extractedPath = process.env.EXTRACTED_PATH

fse.ensureDirSync(uploadedPath);
fse.ensureDirSync(extractedPath);

export function ImportUCREPExcel(db: Knex, excelFile: string) {
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
  return db.raw(queries);
  // return;

}

export function ImportOFCREPExcel(db: Knex, excelFile: string) {
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

export async function ImportSSSREPText(db: Knex, zipFile: string) {

  let txtFile = null;
  const zip = new AdmZip(zipFile);

  const tmpExtractedPath = path.join(extractedPath, moment().format('x'));
  fse.ensureDirSync(tmpExtractedPath);
  // do extract file .zip
  zip.extractAllTo(tmpExtractedPath, true);
  let tmpFiles = Finder.from(tmpExtractedPath).findFiles('*.REP');
  await Promise.all(tmpFiles.map(async (file) => {
    let data = fse.readFileSync(file);
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

    let sqls = [];

    dataSSS.forEach(v => {
      // console.log(v);
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

    rimraf.sync(tmpExtractedPath);
    rimraf.sync(zipFile);
    let queries = sqls.join(';');
    await db.raw(queries);

  }));

}

export function SaveLogs(db: Knex, data) {
  return db('uploaded_logs')
    .insert(data);
}

export function GetLogs(db: Knex) {
  return db('uploaded_logs')
    .orderBy('uploaded_at', 'DESC')
}

export async function Import16Files(db: Knex, filePath: string) {

  const zipFile = filePath;
  const zip = new AdmZip(zipFile);
  // const zipEntries = zip.getEntries();

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
  const tmpExtractedPath = path.join(extractedPath, moment().format('x'));
  fse.ensureDirSync(tmpExtractedPath);
  // do extract file .zip
  zip.extractAllTo(tmpExtractedPath, true);
  let tmpFiles = Finder.from(tmpExtractedPath).findFiles('*.txt');
  // console.log(tmpFiles);

  await Promise.all(tmpFiles.map(async (file) => {
    let fileName = path.basename(file);
    // console.log(fileName)
    if (fileName.toLowerCase() === 'pat.txt') {
      await importData.import16pat(db, file);
    }
    if (fileName.toLowerCase() === 'idx.txt') {
      await importData.import16idx(db, file);
    }
    if (fileName.toLowerCase() === 'ipd.txt') {
      await importData.import16ipd(db, file);
    }
    if (fileName.toLowerCase() === 'opd.txt') {
      await importData.import16opd(db, file);
    }
    if (fileName.toLowerCase() === 'odx.txt') {
      await importData.import16odx(db, file);
    }
    if (fileName.toLowerCase() === 'adp.txt') {
      await importData.import16adp(db, file);
    }
    if (fileName.toLowerCase() === 'aer.txt') {
      await importData.import16aer(db, file);
    }
    if (fileName.toLowerCase() === 'cha.txt') {
      await importData.import16cha(db, file);
    }
    if (fileName.toLowerCase() === 'cht.txt') {
      await importData.import16cht(db, file);
    }
    if (fileName.toLowerCase() === 'dru.txt') {
      await importData.import16dru(db, file);
    }
    if (fileName.toLowerCase() === 'idx.txt') {
      await importData.import16idx(db, file);
    }
    if (fileName.toLowerCase() === 'ins.txt') {
      await importData.import16ins(db, file);
    }
    if (fileName.toLowerCase() === 'iop.txt') {
      await importData.import16iop(db, file);
    }
    if (fileName.toLowerCase() === 'irf.txt') {
      await importData.import16irf(db, file);
    }
    if (fileName.toLowerCase() === 'lvd.txt') {
      await importData.import16lvd(db, file);
    }
    if (fileName.toLowerCase() === 'oop.txt') {
      await importData.import16oop(db, file);
    }
    if (fileName.toLowerCase() === 'orf.txt') {
      await importData.import16orf(db, file);
    }
  }));

  rimraf.sync(tmpExtractedPath);

}

export async function doImportUCSRep(db, files, username, fileType) {

  await Promise.all(files.map(async (file) => {
    let _fileName = file.originalname;
    let _filePath = file.path;
    let chkFile = _fileName.split('_');
    let isExcel = path.extname(_fileName).toLowerCase() === '.xls' || path.extname(_fileName).toLowerCase() === '.xlsx';
    // eclaim_11053_IP_25600501_114105759
    // eclaim_11053_OP_25600501_155047723
    if (chkFile[0].toUpperCase() === 'ECLAIM' && chkFile[1] === process.env.HOSPCODE && (chkFile[2].toUpperCase() === 'IP' || chkFile[2].toUpperCase() === 'OP') && isExcel) {
      const fileName = file.path;
      const originalname = file.originalname;
      await ImportUCREPExcel(db, fileName);

      let uploaded_at = moment().format('YYYY-MM-DD HH:mm:ss');
      let data = {
        filename: originalname,
        filetype: fileType,
        username: username,
        uploaded_at: uploaded_at
      };
      await SaveLogs(db, data);
      rimraf.sync(fileName);
    }
  }));

}

export async function doImportOFCRep(db, files, username, fileType) {

  await Promise.all(files.map(async (file) => {
    let _fileName = file.originalname;
    let _filePath = file.path;
    let chkFile = _fileName.split('_');
    let isExcel = path.extname(_fileName).toLowerCase() === '.xls' || path.extname(_fileName).toLowerCase() === '.xlsx';

    // ECLAIM_11053_20170428143716.zip
    if (chkFile[0].toUpperCase() === 'ECLAIM' && chkFile[1] === process.env.HOSPCODE && (chkFile[2].toUpperCase() === 'IPCS' || chkFile[2].toUpperCase() === 'OPCS' || chkFile[2].toUpperCase() === 'IPLGO' || chkFile[2].toUpperCase() === 'OPLGO') && isExcel) {
      const fileName = file.path;
      const originalname = file.originalname;
      await ImportOFCREPExcel(db, fileName);

      let uploaded_at = moment().format('YYYY-MM-DD HH:mm:ss');
      let data = {
        filename: originalname,
        filetype: fileType,
        username: username,
        uploaded_at: uploaded_at
      };
      await SaveLogs(db, data);
      rimraf.sync(fileName);
    }
  }));

}

export async function doImport16Files(db, files, username, fileType) {

  await Promise.all(files.map(async (file) => {
    let _fileName = file.originalname;
    let _filePath = file.path;
    let chkFile = _fileName.split('_');
    let isZip = path.extname(_fileName).toLowerCase() === '.zip';
    if (chkFile[0].toUpperCase() === 'ECLAIM' && chkFile[1] === process.env.HOSPCODE && isZip) {
      const zipFile = file.path;
      const originalname = file.originalname;
      await Import16Files(db, zipFile);

      let uploaded_at = moment().format('YYYY-MM-DD HH:mm:ss');
      let data = {
        filename: originalname,
        filetype: fileType,
        username: username,
        uploaded_at: uploaded_at
      };
      await SaveLogs(db, data);
      rimraf.sync(zipFile);
    }
  }));

}

export async function doImportSSSRep(db, files, username, fileType) {

  await Promise.all(files.map(async (file) => {
    let _fileName = file.originalname;
    let _filePath = file.path;
    let chkFile = _fileName.split('_');
    let isZip = path.extname(_fileName).toLowerCase() === '.zip';
    if (chkFile[0] === process.env.HOSPCODE && chkFile[1].toUpperCase() === 'SIGNREP' && isZip) {
      const zipFile = file.path;
      const originalname = file.originalname;
      await ImportSSSREPText(db, zipFile);

      let uploaded_at = moment().format('YYYY-MM-DD HH:mm:ss');
      let data = {
        filename: originalname,
        filetype: fileType,
        username: username,
        uploaded_at: uploaded_at
      };
      await SaveLogs(db, data);
      rimraf.sync(zipFile);
    }
  }));

}