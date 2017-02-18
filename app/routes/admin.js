'use strict';
const express = require("express");
const multer = require("multer");
const path = require("path");
const connection_1 = require("../models/connection");
const connection = new connection_1.Connection();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        let _ext = path.extname(file.originalname);
        cb(null, Date.now() + _ext);
    }
});
var upload = multer({ storage: storage });
const router = express.Router();
router.post('/upload', upload.single('file'), (req, res, next) => {
    const csvFile = req.file.path;
    const ext = path.extname(csvFile);
    const startDate = req.body.start;
    const endDate = req.body.end;
    if (ext === '.csv') {
        connection.getConnection()
            .then((conn) => {
        });
    }
    else {
        res.send({ ok: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง' });
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=admin.js.map