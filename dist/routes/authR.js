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
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const router = (0, express_1.Router)();
router.get('/', auths_1.usersPostLogin);
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
// State persistation
router.post('/me', validar_jwt_1.default, auths_1.me);
exports.default = router;
//# sourceMappingURL=authR.js.map