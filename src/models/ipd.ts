import Knex = require('knex');

export class IPDModel {
  getNotSend(db: Knex, start, end) {
    let sql = `
      select i.HN, i.AN, p.TITLE, p.FNAME, p.LNAME, i.DATEDSC, i.TIMEDSC,
      timestampdiff(day, i.DATEDSC, current_date()) as total_late,
      ins.INSCL, ins.SUBTYPE, ct.TOTAL as total_price
      from ipd as i
      inner join pat as p on p.HN=i.HN
      left join ins on ins.AN=i.AN
      left join cht as ct on ct.AN=i.AN
      where i.DATEDSC between ? and ?
      and (i.an not in (select distinct an from eclaim_ucs where service_type='IP' union select distinct an from eclaim_ofc where service_type='IP'))      order by total_late DESC
    `;

    return db.raw(sql, [start, end]);
  }
}