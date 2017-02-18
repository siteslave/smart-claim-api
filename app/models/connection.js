"use strict";
const mysql = require("mysql");
class Connection {
    getConnection() {
        return new Promise((resolve, reject) => {
            let config = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                database: process.env.DB_NAME || 'iattendances',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || ''
            };
            let pool = mysql.createPool(config);
            pool.getConnection((err, connection) => {
                if (err)
                    reject(err);
                else
                    resolve(connection);
            });
            pool.on('connection', (connection) => {
                connection.query('SET NAMES utf8');
            });
        });
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map