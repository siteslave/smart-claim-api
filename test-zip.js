"use strict";
var AdmZip = require("adm-zip");
var path = require("path");
var _ = require("lodash");
var fse = require("fs-extra");
var mysql = require("mysql");
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '043789124',
    database: 'smart_claim',
    multipleStatements: true
});
var fileZip = 'uploads/zip/ECLAIM_11053_20170201085741.zip-1488956515724.zip';
// var zip = new require('node-zip')(data, {base64: false, checkCRC32: true});
var zip = new AdmZip(fileZip);
var zipEntries = zip.getEntries();
var extractPath = 'uploads/extract';
fse.ensureDirSync(extractPath);
var files = {
    pat: null,
    idx: null
};
// console.log(zipEntries);
zipEntries.forEach(function (v) {
    var fileName = path.basename(v.entryName);
    var txtFile = path.extname(v.entryName);
    // console.log(fileName)
    if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'pat.txt') {
        var filePath = path.join(extractPath, v.entryName);
        files.pat = filePath;
    }
    if (!_.startsWith(fileName, '.') && txtFile.toLowerCase() === '.txt' && fileName.toLowerCase() === 'idx.txt') {
        var filePath = path.join(extractPath, v.entryName);
        files.idx = filePath;
    }
});
console.log(files);
zip.extractAllTo(extractPath);
var sqlPat = "LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE pat FIELDS\n        TERMINATED BY \"|\" LINES TERMINATED BY \"\n\"\n        (HCODE, HN, CHANGWAT, AMPHUR, @DOB, SEX, MARRIAGE,\n        OCCUPA, NATION, PERSON_ID, NAMEPAT, TITLE, FNAME, LNAME,\n        IDTYPE) SET DOB=STR_TO_DATE(@DOB, \"%Y%m%d%\")";
var sqlIdx = "LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE idx FIELDS\n        TERMINATED BY \"|\" LINES TERMINATED BY \"\n\"\n        (AN, DIAG, DXTYPE, DRDX)";
pool.getConnection(function (err, connection) {
    // connection.query(sql, [files.pat], (err, result) => {
    //   if (err) console.log(err);
    //   else console.log('Success');
    // });
    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }
        connection.query(sqlPat, [files.pat], function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            connection.query(sqlIdx, [files.idx], function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }
                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            throw err;
                        });
                    }
                    console.log('success!');
                });
            });
        });
    });
});
// zip.extractAllTo('uploads/extract', true); 
