"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auths_1 = require("../controllers/auths");
const express_validator_1 = require("express-validator");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const validar_db_1 = require("../middlewares/validar-db");
const validate_credentials_1 = __importDefault(require("../middlewares/validate-credentials"));
const validateJWT_1 = require("../middlewares/validateJWT");
const router = (0, express_1.Router)();
router.post('/login', [
    (0, express_validator_1.check)('email', 'Email is not valid').isEmail(),
    (0, express_validator_1.check)('password', 'Password is required').not().isEmpty(),
    validar_campos_1.default
], auths_1.usersPostLogin);
router.post('/register', [
    (0, express_validator_1.check)('email', 'Email is not valid').isEmail(),
    (0, express_validator_1.check)('username', 'Username is Required').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Passaword needs to have at least 6 characters').isLength({ min: 6 }),
    (0, express_validator_1.check)('email').custom(validar_db_1.isEmailAlreadyExist),
    validar_campos_1.default
], auths_1.usersPostRegistration);
// Google
router.post('/glogin', [
    (0, express_validator_1.check)('email', 'Email is not valid').isEmail(),
    validar_campos_1.default
], auths_1.googlePostLogin);
router.post('/gregister', [
    (0, express_validator_1.check)('email', 'Email is not valid').isEmail(),
    (0, express_validator_1.check)('username', 'Username is Required').not().isEmpty(),
    validar_campos_1.default
], auths_1.googlePostRegistration);
router.post('/google', auths_1.googleSignIn);
router.get('/gitlab-access-token', (req, res) => {
    const accessToken = req.cookies['gitlabToken'];
    if (accessToken) {
        res.send(`El token de acceso es: ${accessToken}`);
    }
    else {
        res.status(400).send('No se encontró el token de acceso');
    }
});
// State persistation
router.post('/me', validateJWT_1.validateJWT, auths_1.me);
router.post('/extension', [
    (0, express_validator_1.check)('email', 'Email is not valid').isEmail(),
    (0, express_validator_1.check)('password', 'Password is required').not().isEmpty(),
    validar_campos_1.default
], auths_1.extensionController);
router.post('/extension-oauth', auths_1.extensionStartOAuth);
router.post('/extension-auth-user', [
    (0, express_validator_1.check)('code', 'Code is required').not().isEmpty(),
    validate_credentials_1.default,
    validar_campos_1.default
], auths_1.extensionAuthUser);
router.post('/create-token', auths_1.createToken);
router.get('/verify-token', validateJWT_1.validateJWT, (req, res) => {
    res.json({
        state: true,
        msg: 'Token valido'
    });
});
router.post('/new-session', auths_1.registerNewSession);
exports.default = router;
//# sourceMappingURL=authsR.js.map