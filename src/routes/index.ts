'use strict';

import * as express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/',(req,res,next) => {
  res.send({ok: true, version: '0.0.1'});
});

export default router;