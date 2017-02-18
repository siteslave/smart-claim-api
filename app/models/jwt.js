"use strict";
const jwt = require("jsonwebtoken");
class Jwt {
    constructor() {
        this.secretKey = 'xxa94c1883329b47babf53df568c11d26569290c912a54d6bf884136e3ef4d120e';
    }
    sign(playload) {
        let token = jwt.sign(playload, this.secretKey, {
            expiresIn: '1d'
        });
        return token;
    }
    verify(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.secretKey, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(decoded);
                }
            });
        });
    }
}
exports.Jwt = Jwt;
//# sourceMappingURL=jwt.js.map