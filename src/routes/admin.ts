'use strict';

import * as express from 'express';
import * as multer from 'multer';

import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as fse from 'fs-extra';
import * as pdf from 'html-pdf';
import * as gulp from 'gulp';
import * as gulpData from 'gulp-data';
import * as gulpPug from 'gulp-pug';
import * as rimraf from 'rimraf';
import * as json2xls from 'json2xls';

import { unitOfTime } from 'moment';

import { IConnection } from 'mysql';

import { Connection } from '../models/connection';

const connection = new Connection();

// const upload = multer({ dest: 'uploads/' })
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    let _ext = path.extname(file.originalname);
    cb(null, Date.now() + _ext)
  }
})

var upload = multer({ storage: storage })

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res, next) => {
  const csvFile = req.file.path;
  const ext = path.extname(csvFile);
  const startDate = req.body.start;
  const endDate = req.body.end;
  // console.log(req.body);

  if (ext === '.csv') {
    connection.getConnection()
        .then((conn: IConnection) => {
          //return attendancesModel.removeAttendances(_conn, startDate, endDate)
        })
  } else {
    res.send({ ok: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง' });
  }
});

export default router;