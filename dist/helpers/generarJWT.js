"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        const privatekey = process.env.SECRETORPRIVATEKEY;
        if (!privatekey) {
            throw new Error('SECRET_KEY environment variable is not defined');
        }
        jsonwebtoken_1.default.sign(payload, privatekey, { expiresIn: "4hr" }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            }
            else {
                if (!token)
                    return;
                resolve(token);
            }
        });
    });
};
exports.default = generarJWT;
//# sourceMappingURL=generarJWT.js.map