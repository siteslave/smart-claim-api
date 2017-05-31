'use strict';

import * as express from 'express';
import * as crypto from 'crypto';

import { Jwt } from '../models/jwt';
import { LoginModel } from '../models/login';

const router = express.Router();
const jwt = new Jwt();
const loginModel = new LoginModel();

router.post('/', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let userType = req.body.userType;
  let fiscalYear = req.body.fiscalYear;

  if (username && password && userType && fiscalYear) {
    let encPassword = crypto.createHash('md5').update(password).digest('hex');
    let db = req.db;
    let promise;

    if (userType == '1') {
      promise = loginModel.claimLogin(db, username, encPassword);
    } else {
      promise = loginModel.managerLogin(db, username, encPassword);
    }
    promise
      .then((results: any) => {

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
            userType: userType,
            fullname: results[0].fullname,
            username: username,
            fiscalYear: fiscalYear,
            startDate: startDate,
            endDate: endDate
          };
          const token = jwt.sign(payload);
          res.send({ ok: true, token: token })
        } else {
          res.send({ ok: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง' })
        }
      })
      .catch(err => {
        console.log(err);
        res.send({ ok: false, message: err.message });
      });
  } else {
    res.send({ ok: false, message: 'กรุณาระบุชื่อผู้ใช้งานและรหัสผ่าน' })
  }
})

export default router;