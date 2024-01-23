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
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const oauth2Client = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oauth2ClientInstance = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
    const code = req.query.code;
    if (!code) {
        res.status(400).json({
            msg: 'No hay code query',
        });
        throw new Error('No code query parameter');
    }
    try {
        const { tokens } = yield oauth2ClientInstance.getToken(code);
        oauth2ClientInstance.setCredentials(tokens);
        const ticket = yield oauth2ClientInstance.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.CLIENT_ID,
        });
        const userInfo = ticket.getPayload();
        if (!userInfo) {
            throw new Error('No user info found');
        }
        // res.redirect('http://localhost:5173/login');
        return userInfo;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Controller Auth Error message:', error.message);
        }
        throw error;
    }
});
exports.default = oauth2Client;
//# sourceMappingURL=oauth2Client.js.map