"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const notis_1 = require("../controllers/notis");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_roles_1 = require("../middlewares/validar-roles");
const dvValidators_1 = require("../helpers/dvValidators");
const router = (0, express_1.Router)();
router.get('/:id', notis_1.getNotisbyUserId);
router.post('/', notis_1.postNoti);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], notis_1.putNoti);
router.delete('/:id', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist),
    (0, validar_roles_1.showRole)('ADMIN_ROLE', 'VENTAS_ROLE'),
], notis_1.deleteNoti);
exports.default = router;
//# sourceMappingURL=notisR.js.map