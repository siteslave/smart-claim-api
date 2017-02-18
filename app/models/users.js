"use strict";
class UserModel {
    getWorkAllow(connection) {
        return new Promise((resolve, reject) => {
            let sql = `
      select concat(iyear, '-', imonth) as ym, concat(iyear,imonth) as ym2
      from work_time_allow
      order by ym2 desc
      `;
            connection.query(sql, [], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results);
            });
        });
    }
    getWorkHistory(connection, employeeCode, start, end) {
        return new Promise((resolve, reject) => {
            let sql = `
        select *
        from work_type_attendances
        where employee_code=?
        and work_date between ? and ?
      `;
            connection.query(sql, [employeeCode, start, end], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results);
            });
        });
    }
    changePassword(connection, employeeCode, password) {
        return new Promise((resolve, reject) => {
            let sql = `
        update employees set password=? where employee_code=?
      `;
            connection.query(sql, [password, employeeCode], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results);
            });
        });
    }
    saveWork(connection, data) {
        return new Promise((resolve, reject) => {
            let sql = `
        insert into work_type_attendances(employee_code, work_date, work_type, is_process)
        values ?
      `;
            connection.query(sql, [data], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results);
            });
        });
    }
    removeOldWork(connection, employeeCode, start, end) {
        return new Promise((resolve, reject) => {
            let sql = `
        delete from work_type_attendances
        where work_date between ? and ?
        and employee_code=?
        `;
            connection.query(sql, [start, end, employeeCode], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=users.js.map