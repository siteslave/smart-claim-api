'use strict';
const express = require("express");
const crypto = require("crypto");
const jwt_1 = require("../models/jwt");
const login_1 = require("../models/login");
const connection_1 = require("../models/connection");
const router = express.Router();
const jwt = new jwt_1.Jwt();
const loginModel = new login_1.LoginModel();
const connection = new connection_1.Connection();
router.post('/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let userType = req.body.userType;
    if (username && password && userType) {
        let encPassword = crypto.createHash('md5').update(password).digest('hex');
        connection.getConnection()
            .then((conn) => {
            if (userType == '1') {
                return loginModel.adminLogin(conn, username, encPassword);
            }
            else {
                return loginModel.userLogin(conn, username, encPassword);
            }
        })
            .then((results) => {
            if (results.length) {
                const payload = { userType: userType, fullname: results[0].fullname, employeeCode: results[0].employee_code };
                const token = jwt.sign(payload);
                res.send({ ok: true, token: token });
            }
            else {
                res.send({ ok: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง' });
            }
        })
            .catch(err => {
            console.log(err);
            res.send({ ok: false, message: 'Server error!' });
        });
    }
    else {
        res.send({ ok: false, message: 'กรุณาระบุชื่อผู้ใช้งานและรหัสผ่าน' });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=login.js.map