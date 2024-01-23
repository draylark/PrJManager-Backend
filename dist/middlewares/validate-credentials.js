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
const googleapis_1 = require("googleapis");
const validateCredentials = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.body.code;
    console.log('code desde el middleware', code);
    if (!code) {
        return res.status(400).json({
            state: false,
            msg: 'No hay un codigo valido en la peticion'
        });
    }
    try {
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.EXTENSION_CLIENT_ID, process.env.EXTENSION_CLIENT_SECRET, process.env.EXTENSION_REDIRECT_URI);
        // Intercambiar el código por tokens
        const { tokens } = yield oAuth2Client.getToken(code);
        // Ahora puedes usar estos tokens para hacer solicitudes a la API de Google
        oAuth2Client.setCredentials(tokens);
        // Aquí puedes manejar los tokens como necesites
        const people = googleapis_1.google.people({ version: 'v1', auth: oAuth2Client });
        const me = yield people.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses',
        });
        const email = me.data.emailAddresses[0].value;
        req.userEmail = email;
        next();
    }
    catch (error) {
        console.error('Error al intercambiar el código por tokens:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = validateCredentials;
//# sourceMappingURL=validate-credentials.js.map