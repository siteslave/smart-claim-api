"use strict";
var node_xlsx_1 = require("node-xlsx");
var fs = require("fs");
var moment = require("moment");
var mysql = require("mysql");
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '043789124',
    database: 'smart_claim',
    multipleStatements: true
});
// var excelFile = './eclaim_11053_IP_25590229_164841647.xls';
var excelFile = './sample/eclaim_11053_IP_25600305_094434726.xls';
var workSheetsFromFile = node_xlsx_1["default"].parse(fs.readFileSync(excelFile));
var totalData = +workSheetsFromFile[1].data[5][3];
var totalAccept = +workSheetsFromFile[1].data[5][4];
var startRecord = 8;
var stopRecord = startRecord + totalData;
// console.log('Total: ', totalData);
// console.log('Accept: ', totalAccept);
var sqls = [];
for (var _i = startRecord; _i < stopRecord; _i++) {
    // console.log('----------------------------------')
    var data = workSheetsFromFile[0].data[_i];
    // console.log('REP ', data[0]);
    // console.log('TRAN_ID ', data[2]);
    // console.log('HN ', data[3]);
    // console.log('AN ', data[4]);
    // console.log('SERVICE_TYPE ', data[7]);
    // console.log('SERV_DATE ', serveDate);
    // console.log('SERV_TIME ', serveTime);
    // console.log('DCH_DATE ', dchDate);
    // console.log('DCH_TIME ', dchTime);
    // console.log('CHARGE_NHSO ', data[10]);
    // console.log('CHARGE_OTHER ', data[11]);
    // console.log('ERROR_CODE ', data[13]);
    // console.log('PS ', data[44]);
    if (data) {
        var repNo = data[0];
        var tranId = data[2];
        var hn = data[3];
        var an = data[4];
        var serviceType = data[7];
        var serveDate = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        var serveTime = moment(data[8], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[8], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        var dchDate = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD') : '0000-00-00';
        var dchTime = moment(data[9], 'DD/MM/YYYY HH:mm:ss').isValid() ? moment(data[9], 'DD/MM/YYYY HH:mm:ss').format('HH:mm:ss') : '00:00:00';
        var chargeNhso = parseFloat(data[10]) || 0;
        var chargeOther = parseFloat(data[11]) || 0;
        var errorCode = data[13];
        var mainInscl = data[21];
        var subInscl = data[22];
        var lateCount = +data[44];
        var sql = "\n        INSERT INTO eclaim_data\n      (rep_no, tran_id, hn, an, service_type, date_serv, time_serv, date_dch, time_dch,\n      charge_nhso, charge_other, error_code, late_count, main_inscl, sub_inscl)\n      VALUES('" + repNo + "', '" + tranId + "', '" + hn + "', '" + an + "', '" + serviceType + "', \n      '" + serveDate + "', '" + serveTime + "', \n      '" + dchDate + "', '" + dchTime + "', " + chargeNhso + ", " + chargeOther + ", '" + errorCode + "', \n      " + lateCount + ", '" + mainInscl + "', '" + subInscl + "')\n      ON DUPLICATE KEY UPDATE\n      date_serv='" + serveDate + "', time_serv='" + serveTime + "', date_dch='" + dchDate + "', time_dch='" + dchTime + "', \n      charge_nhso=" + chargeNhso + ", charge_other=" + chargeOther + ",\n      error_code='" + errorCode + "', late_count=" + lateCount + ", main_inscl='" + mainInscl + "', sub_inscl='" + subInscl + "'\n  ";
        sqls.push(sql);
    }
}
var queries = sqls.join(';');
pool.getConnection(function (err, connection) {
    connection.query(queries, [], function (err, result) {
        if (err)
            console.log(err);
        else
            console.log('Success');
    });
});
