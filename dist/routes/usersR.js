"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const users_1 = require("../controllers/users");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_roles_1 = require("../middlewares/validar-roles");
const dvValidators_1 = require("../helpers/dvValidators");
const router = (0, express_1.Router)();
router.get('/', users_1.getUsers);
router.get('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], users_1.getUsersById);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], users_1.putUsers);
router.delete('/:id', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist),
    (0, validar_roles_1.showRole)('ADMIN_ROLE', 'VENTAS_ROLE'),
], users_1.deleteUsers);
exports.default = router;
//# sourceMappingURL=usersR.js.map