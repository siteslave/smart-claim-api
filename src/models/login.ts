import Knex = require('knex');
import * as moment from 'moment';

export class LoginModel {
  claimLogin(db: Knex, username: string, password: string) {
    return db('users')
    .select('fullname')
      .where({
        username: username,
        password: password
      })
      .limit(1);
  }
}