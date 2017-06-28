import Knex = require('knex');
import 'rxjs/add/operator/toPromise';

export class UCSModel {
  getNotSendIpd(db: Knex, start, end) {
    let sql = `
      select i.HN, i.AN, p.TITLE, p.FNAME, p.LNAME, i.DATEDSC, i.TIMEDSC,
      timestampdiff(day, i.DATEDSC, current_date()) as total_late,
      ins.INSCL, ins.SUBTYPE, ct.TOTAL as total_price
      from ipd as i
      inner join pat as p on p.HN=i.HN
      left join ins on ins.AN=i.AN
      left join cht as ct on ct.AN=i.AN
      where i.DATEDSC between ? and ?
      and ins.INSCL='UCS'
      and (i.an not in (
        select distinct an
        from eclaim_ucs
        where service_type='IP'
        and date_dch between ? and ?))
      order by total_late DESC
    `;

    return db.raw(sql, [start, end, start, end])
  }

  getNotSendOpd(db: Knex, start, end) {
    let hospcode = process.env.HOSPCODE;
    let sql = `
      select o.HN, o.SEQ, p.TITLE, p.FNAME, p.LNAME, o.DATEOPD, o.TIMEOPD,
      timestampdiff(day, o.DATEOPD, current_date()) as total_late,
      ins.INSCL, ins.SUBTYPE, ct.TOTAL as total_price, e.rep_no
      from opd as o
      inner join pat as p on p.HN=o.HN
      inner join ins on ins.SEQ=o.SEQ
      inner join cht as ct on ct.SEQ=o.SEQ and ct.TOTAL>=50
      left join eclaim_ucs as e on e.hn=o.HN and e.date_serv=o.DATEOPD and date_format(e.time_serv, '%H%i')=o.TIMEOPD
      where o.DATEOPD between ? and ?
      and ins.INSCL='UCS'
      and ins.HOSPMAIN<>?
	    and e.rep_no is null
      order by total_late DESC
    `;

    return db.raw(sql, [start, end, hospcode])
  }
}