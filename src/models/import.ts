import Knex = require('knex');

export class ImportData {
  saveUploadedLog(db: Knex, data) {
    let sql = `
        INSERT INTO uploaded_logs(filename, filetype, username, uploaded_at)
        VALUES(?, ?, ?)
      `;
    return db.raw(sql, [data.filename, data.filetype, data.username, data.uploaded_at]);
  }

  import16pat(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE pat FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HCODE, HN, CHANGWAT, AMPHUR, @DOB, SEX, MARRIAGE,
        OCCUPA, NATION, PERSON_ID, NAMEPAT, TITLE, FNAME, LNAME,
        IDTYPE) SET DOB=STR_TO_DATE(@DOB, "%Y%m%d")`;
    // run query
    return db.raw(sql, [file]);
  }

  import16ipd(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE ipd FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, AN, @DATEADM, TIMEADM, @DATEDSC, TIMEDSC, DISCHS,
        DISCHT, WARDDSC, DEPT, ADM_W, UUC, SVCTYPE)
        SET DATEADM=STR_TO_DATE(@DATEADM, "%Y%m%d"),
        DATEDSC=STR_TO_DATE(@DATEDSC, "%Y%m%d%")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16opd(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE opd FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, CLINIC, @DATEOPD, TIMEOPD, SEQ, UUC)
        SET DATEOPD=STR_TO_DATE(@DATEOPD, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16odx(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE odx FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, @DATEDX, CLINIC, DIAG, DXTYPE, DRDX, PERSON_ID, SEQ)
        SET DATEDX=STR_TO_DATE(@DATEDX, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16idx(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE idx FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (AN, DIAG, DXTYPE, DRDX)
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16adp(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE adp FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, AN, @DATEOPD, TYPE, CODE, QTY, RATE, SEQ, CAGCODE,
        DOSE, CA_TYPE, SERIALNO, TOTCOPAY, USE_STATUS, TOTAL, QTYDAY)
        SET DATEOPD=STR_TO_DATE(@DATEOPD, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16aer(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE aer FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, AN, @DATEOPD, AUTHAE, @AEDATE, AETIME, AETYPE, REFER_NO, REFMAINI,
        IREFTYPE, REFMAINO, OREFTYPE, UCAE, EMTYPE, SEQ, AESTATUS,
        DALERT, TALERT)
        SET DATEOPD=STR_TO_DATE(@DATEOPD, "%Y%m%d"),
        AEDATE=STR_TO_DATE(@AEDATE, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16cha(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE cha FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, AN, @DATE, CHRGITEM, AMOUNT, PERSON_ID, SEQ)
        SET DATE=STR_TO_DATE(@DATE, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16cht(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE cht FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, AN, @DATE, TOTAL, PAID, PTTYPE, PERSON_ID, SEQ)
        SET DATE=STR_TO_DATE(@DATE, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16dru(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE dru FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HCODE, HN, AN, CLINIC, PERSON_ID, @DATE_SERV, DID, DIDNAME,
        AMOUNT, DRUGPRIC, DRUGCOST, DIDSTD, UNIT, UNIT_PACK, SEQ, DRUGTYPE,
        DRUGREMARK, PA_NO, TOTCOPAY, USE_STATUS, TOTAL)
        SET DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16ins(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE ins FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, INSCL, SUBTYPE, CID, @DATEIN, @DATEEXP, HOSPMAIN, HOSPSUB,
        GOVCODE, GOVNAME, PERMITNO, DOCNO, OWNRPID, OWNNAME, AN, SEQ,
        SUBINSCL, RELINSCL, HTYPE)
        SET DATEIN=STR_TO_DATE(@DATEIN, "%Y%m%d"),
        DATEEXP=STR_TO_DATE(@DATEEXP, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16iop(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE iop FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (AN, OPER, OPTYPE, DROPID, @DATEIN, TIMEIN, @DATEOUT, TIMEOUT)
        SET DATEIN=STR_TO_DATE(@DATEIN, "%Y%m%d"),
        DATEOUT=STR_TO_DATE(@DATEOUT, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16irf(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE irf FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (AN, REFER, REFERTYPE)
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16lvd(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE lvd FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (SEQLVD, AN, @DATEOUT, TIMEOUT, @DATEIN, TIMEIN, QTYDAY)
        SET DATEIN=STR_TO_DATE(@DATEIN, "%Y%m%d"),
        DATEOUT=STR_TO_DATE(@DATEOUT, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16oop(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE oop FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, @DATEOPD, CLINIC, OPER, DROPID, PERSON_ID, SEQ)
        SET DATEOPD=STR_TO_DATE(@DATEOPD, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

  import16orf(db: Knex, file) {
    let sql = `LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE orf FIELDS
        TERMINATED BY "|" LINES TERMINATED BY "\n"
        (HN, @DATEOPD, CLINIC, REFER, REFERTYPE, SEQ)
        SET DATEOPD=STR_TO_DATE(@DATEOPD, "%Y%m%d")
        `;
    // run query
    return db.raw(sql, [file]);
  }

}