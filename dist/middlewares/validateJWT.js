"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWT = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const validateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({
            state: false,
            message: 'No hay token un token valido en la peticion'
        });
    }
    if (token === undefined) {
        return res.status(400).json({
            state: false,
            message: 'No hay token un token valido en la peticion'
        });
    }
    try {
        const publicKeyPath = path_1.default.join(process.cwd(), 'keys', 'public_key.pem');
        const publicKey = (0, fs_1.readFileSync)(publicKeyPath, 'utf8');
        if (!publicKey)
            return res.status(400).json({ msg: 'Enviroment variable has not been set' });
        const response = jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ['RS256'] });
        const user = yield userSchema_1.default.findById(response.uid);
        if (!user)
            return res.status(401).json({
                state: false,
                message: 'The user does not exist'
            });
        req.authenticatedUser = user;
        req.user = user;
        req.uid = response.uid;
        next();
    }
    catch (error) {
        return res.status(401).json({
            state: false,
            message: 'Token not valid / User not authorized'
        });
    }
});
exports.validateJWT = validateJWT;
//# sourceMappingURL=validateJWT.js.map