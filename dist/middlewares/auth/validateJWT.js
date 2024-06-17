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
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const validateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({
            state: false,
            success: false,
            message: 'There is no valid token in the request',
            type: 'no-token'
        });
    }
    try {
        const publicKeyPath = path_1.default.join(process.cwd(), 'keys', 'public_key.pem');
        const publicKey = (0, fs_1.readFileSync)(publicKeyPath, 'utf8');
        if (!publicKey) {
            return res.status(500).json({
                message: 'Public key not found',
                type: 'server-error'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ['RS256'] });
        const user = yield userSchema_1.default.findById(decoded.uid).populate({
            path: 'topProjects',
            select: '_id name'
        });
        if (!user) {
            return res.status(401).json({
                state: false,
                success: false,
                message: 'The user does not exist',
                type: 'user-validation'
            });
        }
        req.authenticatedUser = user;
        req.user = user;
        req.uid = decoded.uid;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            // Catch JWT specific errors
            return res.status(401).json({
                state: false,
                success: false,
                message: 'The access token is not valid or your session has ended, restart the page and log in again.',
                type: 'token-validation'
            });
        }
        // Other errors (e.g., DB access issues, file read errors)
        console.error('Server Error:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            type: 'server-error'
        });
    }
});
exports.validateJWT = validateJWT;
//# sourceMappingURL=validateJWT.js.map