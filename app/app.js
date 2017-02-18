'use strict';
require('dotenv').config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const json2xls = require("json2xls");
const jwt_1 = require("./models/jwt");
const jwt = new jwt_1.Jwt();
const index_1 = require("./routes/index");
const admin_1 = require("./routes/admin");
const login_1 = require("./routes/login");
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(json2xls.middleware);
let userAuth = (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.query && req.query.token) {
        token = req.query.token;
    }
    else {
        token = req.body.token;
    }
    jwt.verify(token)
        .then((decoded) => {
        if (decoded.userType == '2') {
            req.decoded = decoded;
            next();
        }
        else {
            return res.send({ ok: false, error: 'Permission denied!' });
        }
    }, err => {
        return res.send({
            ok: false,
            error: 'No token provided.',
            code: 403
        });
    });
};
let adminAuth = (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.query && req.query.token) {
        token = req.query.token;
    }
    else {
        token = req.body.token;
    }
    jwt.verify(token)
        .then((decoded) => {
        if (decoded.userType == '1') {
            req.decoded = decoded;
            console.log(req.decoded);
            next();
        }
        else {
            return res.send({ ok: false, error: 'Permission denied!' });
        }
    }, err => {
        return res.send({
            ok: false,
            error: 'No token provided.',
            code: 403
        });
    });
};
app.use('/login', login_1.default);
app.use('/admin', adminAuth, admin_1.default);
app.use('/', index_1.default);
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
if (process.env.NODE_ENV === 'development') {
    app.use((err, req, res, next) => {
        res.status(err['status'] || 500);
        console.log(err);
    });
}
app.use((err, req, res, next) => {
    res.status(err['status'] || 500);
    console.log(err);
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;
//# sourceMappingURL=app.js.map