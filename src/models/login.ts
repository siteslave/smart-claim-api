import Knex = require('knex');
import * as moment from 'moment';

export class LoginModel {
  managerLogin(db: Knex, username: string, password: string) {
    return db('users')
    .select('fullname')
      .where({
        username: username,
        password: password,
        user_type: '2'
      })
      .limit(1);
  }

  claimLogin(db: Knex, username: string, password: string) {
    return db('users')
    .select('fullname')
      .where({
        username: username,
        password: password,
        user_type: '1'
      })
      .limit(1);
  }
}