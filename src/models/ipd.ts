import Knex = require('knex');

export class IPDModel {
  getNotSend(db: Knex, start, end) {
    let sql = `
      select i.HN, i.AN, p.TITLE, p.FNAME, p.LNAME, i.DATEDSC, i.TIMEDSC,
      e.rep_no, timestampdiff(day, i.DATEDSC, current_date()) as total_late,
      ins.INSCL, ins.SUBTYPE, ct.TOTAL as total_price
      from ipd as i
      inner join pat as p on p.HN=i.HN
      left join eclaim_data as e on e.an=i.an
      left join ins on ins.AN=i.AN
      left join cht as ct on ct.AN=i.AN
      where i.DATEDSC between ? and ?
      and e.rep_no is null
      order by i.AN
    `;

    return db.raw(sql, [start, end]);
  }
}