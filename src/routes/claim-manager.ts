'use strict';

import * as express from 'express';
import * as multer from 'multer';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as fse from 'fs-extra';

import { IZipEntry } from 'adm-zip';
import { unitOfTime } from 'moment';
import { ImportData } from '../models/import';
import { Importor } from '../models/importor';

import { OPDModel } from '../models/opd';
import { IPDModel } from "../models/ipd";

const importData = new ImportData();
const importor = new Importor();
const opdModel = new OPDModel();
const ipdModel = new IPDModel();

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

router.post('/upload', upload.single('files'), (req, res, next) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const fileType = req.body.fileType;
  const db = req.db;
  console.log(req.body);
  console.log(req.files);
  
  if (filePath) {
    if (fileType === '1') {
      importor.doImportF16(db, filePath)
        .then(() => {
          let username = req.decoded.username;
          let uploaded_at = moment().format('YYYY-MM-DD HH:mm:ss');
          let data = {
            filename: fileName,
            filetype: fileType,
            username: username,
            uploaded_at: uploaded_at
          };
          return importor.saveLogs(db, data);
        })
        .then(() => {
          res.send({ ok: true });
        })
        .catch(err => {
          console.log(err);
          res.send({ ok: false, error: err });
        })
    } else if (fileType === '2') { // UC REP
      // rep eclaim
      importor.doImportUCREPExcel(db, filePath)
        .then(() => {
          let username = req.decoded.username;
          let uploaded_at = moment().format('YYYY-MM-DD HH:mm:ss');
          let data = {
            filename: fileName,
            filetype: fileType,
            username: username,
            uploaded_at: uploaded_at
          };
          return importor.saveLogs(db, data);
        })
        .then(() => {
          res.send({ ok: true });
        })
        .catch(error => {
          console.log(error);
          res.send({ ok: false, error: error });
        });
    } else {
      res.send({ ok: false, error: 'กรุณาเลือกประเภทไฟล์ที่ต้องการอัปโหลด' })
    }
  } else {
    res.send({ ok: false, error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' });
  }

});

router.get('/imports/logs', (req, res, next) => {
  let db = req.db;
  importor.getLogs(db)
    .then((rows) => {
      res.send({ ok: true, rows: rows });
    })
    .catch(err => {
      console.log(err);
      res.send({ ok: false, error: err });
    })
});

router.post('/ipd/not-send', (req, res, next) => {
  let db = req.db;
  let start = req.body.start;
  let end = req.body.end;

  ipdModel.getNotSend(db, start, end)
    .then((rows) => {
      const _rows = rows[0];
      let data: any = [];
      _rows.forEach(v => {
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
      res.send({ ok: true, rows: data })
    })
    .catch((error) => {
      console.log(error);
      res.send({ ok: false, error: error });
    });
});

export default router;