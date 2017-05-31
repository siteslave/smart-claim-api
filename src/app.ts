'use strict';
require('dotenv').config();
import Knex = require('knex');
import { MySqlConnectionConfig } from "knex";
import * as express from 'express';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { Jwt } from './models/jwt';
const jwt = new Jwt();

import indexRoute from './routes/index';
import managerRoute from './routes/manager';
import claimRoute from './routes/claim-manager';
import loginRoute from './routes/login';

const app: express.Express = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// upload directory
const uploadedPath = path.join(__dirname, process.env.UPLOADED_PATH);
fse.ensureDirSync(uploadedPath);

let authClaim = (req, res, next) => {
  let token: string = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
    .then((decoded: any) => {
      if (decoded.userType == '1') { // claim manager
        req.decoded = decoded;
        // console.log(req.decoded);
        next();
      } else {
        return res.send({ ok: false, error: 'Permission denied!' });
      }
    }, err => {
      return res.send({
        ok: false,
        error: 'No token provided.',
        code: 403
      });
    });
}

let connection: MySqlConnectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
}

let db = Knex({
  client: 'mysql',
  connection: connection,
  pool: { min: 0, max: 10 }
});

app.use((req, res, next) => {
  req.db = db;
  next();
})

app.use((req, res, next) => {
  req.db = db;
  next();
});

let authManager = (req, res, next) => {
  let token: string = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
    .then((decoded: any) => {
      if (decoded.userType == '2') { // manager
        req.decoded = decoded;
        console.log(req.decoded);
        next();
      } else {
        return res.send({ ok: false, error: 'Permission denied!' });
      }
    }, err => {
      return res.send({
        ok: false,
        error: 'No token provided.',
        code: 403
      });
    });
}

app.use('/login', loginRoute);
app.use('/manager', authManager, managerRoute);
app.use('/claim-manager', authClaim, claimRoute);
// app.use('/', indexRoute);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

//error handlers

//development error handler
//will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err: Error, req, res, next) => {
    res.status(err['status'] || 500)
    .send({ok: false, error: err.message});
    console.log(err);
  });
}

//production error handler
// no stacktrace leaked to user
app.use((err: Error, req, res, next) => {
  res.status(err['status'] || 500)
    .send({ ok: false, error: err.message });
  console.log(err);
});

export default app;
