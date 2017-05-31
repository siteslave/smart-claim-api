import * as jwt from 'jsonwebtoken';

export class Jwt {
  private secretKey = '4564545fdssdfxxa94c1883329b47babf53df568c11d26569290c912a54d6bf884136e3ef4d120e';

  sign(playload: any) {
    let token = jwt.sign(playload, this.secretKey, {
      expiresIn: '3h'
    });
    return token;
  }

  verify(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secretKey, (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded)
        }
      });
    });
  }

}