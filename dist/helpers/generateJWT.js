"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const generateJWT = (uid, state) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, state };
        const privateKeyPath = path_1.default.join(process.cwd(), 'keys', 'private_key.pem');
        const privateKey = (0, fs_1.readFileSync)(privateKeyPath, 'utf8');
        if (!privateKey) {
            throw new Error('SECRET_KEY environment is not defined');
        }
        jsonwebtoken_1.default.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: "5hr" }, (err, token) => {
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
exports.generateJWT = generateJWT;
//# sourceMappingURL=generateJWT.js.map