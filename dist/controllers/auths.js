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
exports.registerNewSession = exports.createToken = exports.extensionAuthUser = exports.extensionStartOAuth = exports.extensionController = exports.me = exports.usersPostLogin = exports.usersPostRegistration = exports.googlePostLogin = exports.googleSignIn = exports.googlePostRegistration = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const generarJWT_1 = __importDefault(require("../helpers/generarJWT"));
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const generatePAT_1 = require("../helpers/generatePAT");
const generateJWT_1 = require("../helpers/generateJWT");
const sessionSchema_1 = __importDefault(require("../models/sessionSchema"));
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
        if (!user.state) {
            return res.status(400).json({
                msg: 'La cuenta ya no existe o ha sido suspendida.',
            });
        }
        // ! verificar la password
        if (!user.password)
            return res.status(400).json({
                msg: 'El email o la password son incorrectos.'
            });
        const validPassword = bcryptjs_1.default.compareSync(password, user.password);
        if (!validPassword)
            return res.status(400).json({
                msg: 'La password es incorrecta'
            });
        const tokenJWT = yield (0, generateJWT_1.generateJWT)(user.id, user.state);
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
        const user = yield userSchema_1.default.findOne({ email })
            .populate({
            path: 'topProjects',
            select: '_id name'
        });
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
        const token = yield (0, generateJWT_1.generateJWT)(user.id, user.state);
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
const extensionController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!user.state) {
            return res.status(400).json({
                msg: 'La cuenta ya no existe o ha sido suspendida.',
            });
        }
        // ! verificar la password
        if (!user.password)
            return res.status(400).json({
                msg: 'El email o la password son incorrectos.'
            });
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
exports.extensionController = extensionController;
const extensionStartOAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, socketID, port } = req.body;
    console.log('Type:', type, 'SocketID:', socketID, 'Port:', port);
    try {
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.EXTENSION_CLIENT_ID, process.env.EXTENSION_CLIENT_SECRET, process.env.EXTENSION_REDIRECT_URI);
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ];
        const stateObj = {
            type: type || '',
            npmsocket: socketID || '',
            port: port || '',
            extraParam: 'state_parameter_passthrough_value'
        };
        const stateValue = JSON.stringify(stateObj);
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: stateValue,
            redirect_uri: process.env.EXTENSION_REDIRECT_URI
        });
        res.json({ url });
    }
    catch (error) {
        console.error('Error al iniciar la autenticación OAuth:', error);
        res.status(500).send('Error interno del servidor');
    }
});
exports.extensionStartOAuth = extensionStartOAuth;
const extensionAuthUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.userEmail;
        const user = yield userSchema_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({
                status: false,
                msg: 'The email is not registered, please register first.'
            });
        if (!user.state)
            return res.status(403).json({
                status: false,
                msg: 'The account no longer exists or has been suspended.',
            });
        const token = yield (0, generateJWT_1.generateJWT)(user.id, user.state);
        const userPAT = (0, generatePAT_1.generatePAT)();
        user.personalAccessToken = userPAT;
        yield user.save();
        res.status(200).json({
            status: true,
            user: {
                uid: user._id,
                email: user.email,
                username: user.username,
                photoUrl: user.photoUrl,
            },
            pat: userPAT,
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
exports.extensionAuthUser = extensionAuthUser;
const createToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.body;
    try {
        const token = yield (0, generateJWT_1.generateJWT)(uid, true);
        res.json({
            status: true,
            token
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createToken = createToken;
const registerNewSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, PRJACCUID, NPMUID } = req.body;
    const operativeSystem = req.headers['x-client-os'];
    const device = req.headers['x-client-device-type'];
    try {
        const session = new sessionSchema_1.default({
            uid: PRJACCUID,
            prjConsoleUID: NPMUID,
            extensionUID: _id,
            operativeSystem,
            device
        });
        yield session.save();
        res.status(200).json({
            success: false,
            message: 'New session saved.'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'There wan an internal error'
        });
    }
    ;
});
exports.registerNewSession = registerNewSession;
//# sourceMappingURL=auths.js.map