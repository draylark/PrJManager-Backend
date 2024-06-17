"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clients_1 = require("../controllers/clients");
const express_validator_1 = require("express-validator");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const client_validator_1 = __importDefault(require("../middlewares/client-validator"));
const router = (0, express_1.Router)();
router.post('/', [
    client_validator_1.default,
    (0, express_validator_1.check)('email', 'Not a valid Email').isEmail(),
    (0, express_validator_1.check)('phoneNumber', 'Not a valid Phone Number').isMobilePhone('any'),
    validar_campos_1.default
], clients_1.postClient);
router.get('/:userId', [], clients_1.getClient);
router.put('/');
router.delete('/');
exports.default = router;
//# sourceMappingURL=clientR.js.map