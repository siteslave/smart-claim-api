
import { OPDModel } from '../models/opd';
import { IPDModel } from "../models/ipd";
import { UCSModel } from '../models/ucs';
import { OFCModel } from '../models/ofc';

import * as express from 'express';
import * as multer from 'multer';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as fse from 'fs-extra';
import * as rimraf from 'rimraf';
import * as wrap from 'co-express';

import { IZipEntry } from 'adm-zip';
import { unitOfTime } from 'moment';
import {
  Import16Files,
  ImportOFCREPExcel,
  ImportSSSREPText,
  ImportUCREPExcel,
  doImport16Files,
  doImportOFCRep,
  doImportSSSRep,
  doImportUCSRep,
  SaveLogs,
  GetLogs
} from '../models/importor';

// const importor = new Importor();
const opdModel = new OPDModel();
const ipdModel = new IPDModel();
const ucsModel = new UCSModel();
const ofcModel = new OFCModel();

const uploadedPath = path.join(__dirname, process.env.UPLOADED_PATH);
const extractedPath = path.join(__dirname, process.env.EXTRACTED_PATH);
// const extractedPath = process.env.EXTRACTED_PATH;

fse.ensureDirSync(uploadedPath)
fse.ensureDirSync(extractedPath)
// const upload = multer({ dest: 'uploads/' })
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadedPath)
  },
  filename: function (req, file, cb) {
    // console.log(file)
    let _ext = path.extname(file.originalname);
    let baseName = path.basename(file.originalname);
    cb(null, baseName.slice(0, -4) + '-' + Date.now() + _ext)
  }
})

var upload = multer({ storage: storage })

const router = express.Router();

router.post('/upload', upload.any(), (req, res, next) => {
  const db = req.db;
  const files = req.files;
  const fileType = req.body.fileType;

  if (files.length) {

    const filePath = null;//req.file.path;
    const fileName = null;//req.file.originalname;

    if (fileType === '1') {
      let username = req.decoded.username;
      try {
        doImport16Files(req.db, files, username, fileType)
          .then(() => {
            res.send({ ok: true });
          })
          .catch(error => {
            console.log(error);
            res.send({ ok: false, error: error });
          });
      } catch (error) {
        console.log(error);
        res.send({ ok: false, error: error.message });
      }
    } else if (fileType === '2') { // UC REP
      let username = req.decoded.username;
      try {
        doImportUCSRep(req.db, files, username, fileType)
          .then(() => {
            res.send({ ok: true });
          })
          .catch(error => {
            console.log(error);
            res.send({ ok: false, error: error });
          });
      } catch (error) {
        console.log(error);
        res.send({ ok: false, error: error.message });
      }

    } else if (fileType === '3') { // OFC REP
      let username = req.decoded.username;

      try {
        doImportOFCRep(req.db, files, username, fileType)
          .then(() => {
            res.send({ ok: true });
          })
          .catch(error => {
            console.log(error);
            res.send({ ok: false, error: error });
          });
      } catch (error) {
        console.log(error);
        res.send({ ok: false, error: error.message });
      }
    } else if (fileType === '4') { // SSS
      let username = req.decoded.username;
      try {
        doImportSSSRep(req.db, files, username, fileType)
          .then(() => {
            res.send({ ok: true });
          })
          .catch(error => {
            console.log(error);
            res.send({ ok: false, error: error });
          });
      } catch (error) {
        console.log(error);
        res.send({ ok: false, error: error.message });
      }

    } else {
      res.send({ ok: false, error: 'กรุณาเลือกประเภทไฟล์ที่ต้องการอัปโหลด' })
    }

  } else {
    res.send({ ok: false, error: 'ไม่พบไฟล์ที่ต้องการนำเข้าข้อมูล' })
  }

});

router.get('/imports/logs', wrap(async(req, res, next) => {
  let db = req.db;
  try {
    let rows = await GetLogs(db);
    res.send({ ok: true, rows: rows });
  } catch (error) {
    console.log(error);
      res.send({ ok: false, erroror: error });
  }
}));

router.post('/ofc/not-send', wrap(async (req, res, next) => {
  let db = req.db;
  let start = req.body.start;
  let end = req.body.end;
  let type = req.body.type;
  let rows = [];
  let data = [];

  try {

    if (type === 'OP') {
      rows = await ofcModel.getNotSendOpd(db, start, end);
      rows[0].forEach(v => {
        let obj: any = {};
        obj.seq = v.SEQ;
        obj.an = null;
        obj.hn = v.HN;
        obj.ptname = `${v.TITLE}${v.FNAME}  ${v.LNAME}`;
        obj.date_serv = `${moment(v.DATEOPD).format('DD/MM')}/${moment(v.DATEOPD).get('year') + 543}`;
        obj.time_serv = moment(v.TIMEOPD, 'HHmm').format('HH:mm');
        obj.dchdate = null;
        obj.dchtime = null;
        obj.inscl = v.INSCL;
        obj.total_late = v.total_late;
        obj.total_price = v.total_price;
        data.push(obj);
      });
    } else {
      rows = await ofcModel.getNotSendIpd(db, start, end);
      rows[0].forEach(v => {
        let obj: any = {};
        obj.an = v.AN;
        obj.hn = v.HN;
        obj.ptname = `${v.TITLE}${v.FNAME}  ${v.LNAME}`;
        obj.dchdate = `${moment(v.DATEDSC).format('DD/MM')}/${moment(v.DATEDSC).get('year') + 543}`;
        obj.dchtime = moment(v.TIMEDSC, 'HHmm').format('HH:mm');
        obj.inscl = v.INSCL;
        obj.total_late = v.total_late;
        obj.total_price = v.total_price;
        data.push(obj);
      });
    }

    res.send({ ok: true, rows: data });

  } catch (error) {
    res.send({ ok: false, error: error.message });
  }

}));

router.post('/ucs/not-send', wrap(async (req, res, next) => {
  let db = req.db;
  let start = req.body.start;
  let end = req.body.end;
  let type = req.body.type;
  let rows = [];
  let data = [];

  try {

    if (type === 'OP') {
      rows = await ucsModel.getNotSendOpd(db, start, end);
      rows[0].forEach(v => {
        let obj: any = {};
        obj.seq = v.SEQ;
        obj.an = null;
        obj.hn = v.HN;
        obj.ptname = `${v.TITLE}${v.FNAME}  ${v.LNAME}`;
        obj.date_serv = `${moment(v.DATEOPD).format('DD/MM')}/${moment(v.DATEOPD).get('year') + 543}`;
        obj.time_serv = moment(v.TIMEOPD, 'HHmm').format('HH:mm');
        obj.dchdate = null;
        obj.dchtime = null;
        obj.inscl = v.INSCL;
        obj.total_late = v.total_late;
        obj.total_price = v.total_price;
        data.push(obj);
      });
    } else {
      rows = await ucsModel.getNotSendIpd(db, start, end);
      rows[0].forEach(v => {
        let obj: any = {};
        obj.an = v.AN;
        obj.hn = v.HN;
        obj.ptname = `${v.TITLE}${v.FNAME}  ${v.LNAME}`;
        obj.dchdate = `${moment(v.DATEDSC).format('DD/MM')}/${moment(v.DATEDSC).get('year') + 543}`;
        obj.dchtime = moment(v.TIMEDSC, 'HHmm').format('HH:mm');
        obj.inscl = v.INSCL;
        obj.total_late = v.total_late;
        obj.total_price = v.total_price;
        data.push(obj);
      });
    }

    res.send({ ok: true, rows: data });

  } catch (error) {
    res.send({ ok: false, error: error.message });
  }

}));

export default router;
