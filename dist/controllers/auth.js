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
exports.me = exports.usersPostLogin = exports.usersPostRegistration = exports.googlePostLogin = exports.googleSignIn = exports.googlePostRegistration = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const generarJWT_1 = __importDefault(require("../helpers/generarJWT"));
const google_auth_library_1 = require("google-auth-library");
const usersPostLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userSchema_1.default.findOne({ email });
        // ! verificar si el email existe
        if (!user)
            return res.status(400).json({
                status: false,
                msg: 'El email o la password son incorrectos.'
            });
        // ! verificar si el usuario sigue activo en la db
        // if(  !user.state  ) {
        //     return res.status(400).json({
        //         msg: 'La cuenta ya no existe o ha sido suspendida.',
        //     })
        // }
        // ! verificar la password
        if (!user.password)
            return;
        const validPassword = bcryptjs_1.default.compareSync(password, user.password);
        if (!validPassword)
            return res.status(400).json({
                msg: 'La password es incorrecta'
            });
        const tokenJWT = yield (0, generarJWT_1.default)(user.id);
        res.json({
            status: true,
            user,
            tokenJWT
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }
});
exports.usersPostLogin = usersPostLogin;
const usersPostRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role } = req.body;
    try {
        const user = new userSchema_1.default({ username, email, password, role });
        const salt = bcryptjs_1.default.genSaltSync(10);
        user.password = bcryptjs_1.default.hashSync(password, salt);
        yield user.save();
        const token = yield (0, generarJWT_1.default)(user.id);
        res.json({
            status: true,
            token,
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
});
exports.usersPostRegistration = usersPostRegistration;
const googlePostLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield userSchema_1.default.findOne({ email });
        // ! verificar si el email existe
        if (!user)
            return res.status(400).json({
                status: false,
                msg: 'El email no esta registrado'
            });
        // ! verificar si el usuario sigue activo en la db
        // if(  !user.state  ) {
        //     return res.status(400).json({
        //         msg: 'La cuenta ya no existe o ha sido suspendida.',
        //     })
        // }
        const token = yield (0, generarJWT_1.default)(user.id);
        res.json({
            status: true,
            token,
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }
});
exports.googlePostLogin = googlePostLogin;
const googlePostRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, photoUrl } = req.body;
    console.log(username);
    try {
        const user = new userSchema_1.default({ email, username, photoUrl });
        yield user.save();
        // ! verificar si el email existe
        // if( !user ) return res.status(400).json({
        //         status: false,
        //         msg: 'El email no esta registrado'
        //     })
        // ! verificar si el usuario sigue activo en la db
        // if(  !user.state  ) {
        //     return res.status(400).json({
        //         msg: 'La cuenta ya no existe o ha sido suspendida.',
        //     })
        // }
        const token = yield (0, generarJWT_1.default)(user.id);
        res.cookie('authToken', token, { httpOnly: true, secure: true });
        res.json({
            status: true,
            user,
            token
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }
});
exports.googlePostRegistration = googlePostRegistration;
const googleSignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'postmessage');
    try {
        const { tokens } = yield oAuth2Client.getToken(req.body.code); // exchange code for tokens
        console.log('tokensitos', tokens);
        const idToken = tokens.id_token;
        if (typeof idToken !== 'string')
            return;
        const ticket = yield oAuth2Client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.payload;
        res.json({
            payload,
            idToken
        });
    }
    catch (error) {
        console.error('Error al autenticar con Google:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
exports.googleSignIn = googleSignIn;
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Verificar el estado del token
    res.json({
        state: true,
        user: req.authenticatedUser
    });
});
exports.me = me;
//# sourceMappingURL=auth.js.map