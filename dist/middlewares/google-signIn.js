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
exports.handleGoogleCallbackMiddleware = exports.googleSignIn = void 0;
const google_auth_library_1 = require("google-auth-library");
const clientId = '754198416776-s13ftfnvasskentufnd3rcuugdj4glsr.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:3000/api/users/login';
const oauth2Client = new google_auth_library_1.OAuth2Client(clientId, clientSecret, redirectUri);
const googleSignIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    });
    res.redirect(authUrl);
    next();
});
exports.googleSignIn = googleSignIn;
const handleGoogleCallbackMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    if (code) {
        try {
            const { tokens } = yield oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            req.tokens = tokens;
            next();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else {
        next();
    }
});
exports.handleGoogleCallbackMiddleware = handleGoogleCallbackMiddleware;
//# sourceMappingURL=google-signIn.js.map