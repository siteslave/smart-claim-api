'use strict';

import * as express from 'express';
import * as crypto from 'crypto';
import * as wrap from 'co-express';

import { Jwt } from '../models/jwt';
import { LoginModel } from '../models/login';

const router = express.Router();
const jwt = new Jwt();
const loginModel = new LoginModel();

router.post('/', wrap(async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let fiscalYear = req.body.fiscalYear;
  console.log(req.body);
  if (username && password && fiscalYear) {
    let encPassword = crypto.createHash('md5').update(password).digest('hex');
    let db = req.db;
    console.log(db);
    console.log(encPassword);
    try {
      const results: any = await loginModel.claimLogin(db, username, encPassword);
      console.log(results);

      let startDate;
      let endDate;

      if (fiscalYear === '2016') {
        startDate = '2015-10-01';
        endDate = '2016-09-30';
      } else if (fiscalYear === '2017') {
        startDate = '2016-10-01';
        endDate = '2017-09-30';
      } else { // 2018
        startDate = '2017-10-01';
        endDate = '2018-09-30';
      }
      
      if (results.length) {
        const payload = {
          fullname: results[0].fullname,
          username: username,
          fiscalYear: fiscalYear,
          startDate: startDate,
          endDate: endDate
        };
        const token = jwt.sign(payload);
        res.send({ ok: true, token: token })
      } else {
        res.send({ ok: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง' })
      }
    } catch (error) {
      res.send({ ok: false, error: error.message });
    }
  } else {
    res.send({ ok: false, error: 'กรุณาระบุชื่อผู้ใช้งานและรหัสผ่าน' })
  }
}));

export default router;
