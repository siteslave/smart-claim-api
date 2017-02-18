"use strict";
class LoginModel {
    adminLogin(connection, username, password) {
        return new Promise((resolve, reject) => {
            let sql = `
      select id as employee_code, fullname from admin where username=? and password=?
      `;
            connection.query(sql, [username, password], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results);
            });
        });
    }
    userLogin(connection, username, password) {
        return new Promise((resolve, reject) => {
            let sql = `
      select employee_code, employee_name as fullname 
      from employees where employee_code=? and password=?
      `;
            connection.query(sql, [username, password], (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results);
            });
        });
    }
}
exports.LoginModel = LoginModel;
//# sourceMappingURL=login.1.js.map