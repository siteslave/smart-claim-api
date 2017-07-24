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
      inner join cht as ct on ct.SEQ=o.SEQ and ct.TOTAL>0
      left join eclaim_ucs as e on e.hn=o.HN and e.date_serv=o.DATEOPD and date_format(e.time_serv, '%H%i')=o.TIMEOPD
      where o.DATEOPD between ? and ?
      and ins.INSCL='UCS'
      and ins.HOSPMAIN<>?
	    and e.rep_no is null
      order by total_late DESC
    `;

    return db.raw(sql, [start, end, hospcode])
  }

  getClaimTotal(db: Knex, start, end) {
    let sql = `select DATE_FORMAT(u.date_serv, '%Y-%m') as date_serv, sum(u.charge_total) as total
              from eclaim_ucs as u
              where u.date_serv between ? and ?
              and u.service_type='IP'
              and (u.error_code='-' or u.error_code is null)
              group by DATE_FORMAT(u.date_serv, '%Y-%m')
              `;
    return db.raw(sql, start, end)
  }

  getClaimSummaryOpd(db: Knex, start: any, end: any) {
    console.log(start, end);
    let sql = `
    select DATE_FORMAT(e.date_serv, '%Y-%m') as date_serv, sum(e.charge_total) as total
    from eclaim_ucs as e
    where e.date_serv between ? and ?
    and e.service_type='OP'
    group by DATE_FORMAT(e.date_serv, '%Y%m')
    `;

    return db.raw(sql, [start, end]);
  }

  getClaimSummaryIpd(db: Knex, start: any, end: any) {
    console.log(start, end);
    let sql = `
    select DATE_FORMAT(e.date_dch, '%Y-%m') as date_serv, sum(e.charge_total) as total
    from eclaim_ucs as e
    where e.date_dch between ? and ?
    and e.service_type='IP'
    group by DATE_FORMAT(e.date_dch, '%Y%m')
    `;

    return db.raw(sql, [start, end]);
  }

  getTotalIpdAdmit(db: Knex, start, end) {
    let sql = `
    select DATE_FORMAT(i.DATEDSC, '%Y-%m') as date_serv, count(*) as total
    from ipd as i
    inner join ins as n on n.AN=i.AN and n.INSCL='UCS'
    where i.DATEDSC between ? and ?
    group by DATE_FORMAT(i.DATEDSC, '%Y%m')
    `;

    return db.raw(sql, [start, end]);
  }

  getTotalIpdClaim(db: Knex, start, end) {
    let sql = `
    select DATE_FORMAT(e.date_dch, '%Y-%m') as date_serv, count(*) as total
    from eclaim_ucs as e
    where e.date_dch between ? and ?
    and e.service_type='IP'
    group by DATE_FORMAT(e.date_dch, '%Y%m')
    `;

    return db.raw(sql, [start, end]);
  }

  getTotalOpdService(db: Knex, start, end) {
    let sql = `
    select DATE_FORMAT(o.DATEOPD, '%Y-%m') as date_serv, count(*) as total
    from opd as o
    inner join ins as n on n.HN=o.HN and n.SEQ=o.SEQ and n.INSCL='UCS'
    where o.DATEOPD between ? and ?
    and n.HOSPMAIN<>?
    group by DATE_FORMAT(o.DATEOPD, '%Y%m')
    `;

    return db.raw(sql, [start, end, process.env.HOSPCODE]);
  }

  getTotalOpdClaim(db: Knex, start, end) {
    let sql = `
    select DATE_FORMAT(e.date_serv, '%Y-%m') as date_serv, count(*) as total
    from eclaim_ucs as e
    where e.date_serv between ? and ?
    and e.service_type='OP'
    group by DATE_FORMAT(e.date_serv, '%Y%m')
    `;

    return db.raw(sql, [start, end]);
  }

  
}