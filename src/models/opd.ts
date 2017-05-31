import { Sql, Raw, RawBuilder, RawQueryBuilder, QueryBuilder, QueryInterface } from 'knex';
import Knex = require('knex');

export class OPDModel {
  getList(db: Knex) {
    /*
    select p.NAMEPAT, o.*, ins.INSCL, ins.HOSPMAIN, ins.HOSPSUB,
(
select e.rep_no from eclaim_data as e 
where e.hn=o.HN and e.time_serv=date_format(o.timeopd, '%H%i') and e.date_serv=o.DATEOPD
limit 1
) as claim
from opd as o
inner join ins as ins on ins.SEQ=o.SEQ
inner join pat as p on p.hn=o.hn
where o.DATEOPD between '2017-02-01' and '2017-02-28'
and ins.INSCL IN ('UCS', 'WEL')
and ins.HOSPMAIN<>'11053'
and ins.HOSPMAIN<>''
order by o.SEQ
    */
    return new Promise((resolve, reject) => {
  
      let subQuery = db.select('e.rep_no')
        .from('eclaim_data as e')
        .where('e.hn', 'o.hn')
        .whereRaw('e.time_serv=date_format(o.timeopd, "%H%i")')
        .whereRaw('e.date_serv=o.DATEOPD')
        .limit(1)
        .as('claim');
      let knex = db;
      let sql = db.table('opd as o')
        .select('p.NAMEPAT', 'o.*', 'ins.INSCL', knex.raw('count(*) as total'), 'ins.HOSPMAIN', 'ins.HOSPSUB', subQuery)
        .innerJoin('ins as ins', 'ins.SEQ', 'o.SEQ')
        .innerJoin('pat as p', 'p.hn', 'o.hn')
        .whereBetween('o.DATEOPD', ['2017-02-01', '2017-02-28'])
        .whereIn('ins.INSCL', ['UCS', 'WEL'])
        .whereNot('ins.HOSPMAIN', '11053')
        .whereNot('ins.HOSPMAIN', '')
        // .orderBy('o.SEQ')
        .toString()
      console.log(sql);
        // .then((results) => {
        //   resolve(results);
        // })
        // .catch((error) => {
        //   reject(error);
        // });
    });
  }
}