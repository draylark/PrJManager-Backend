"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const tasks_1 = require("../controllers/tasks");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_roles_1 = require("../middlewares/validar-roles");
const dvValidators_1 = require("../helpers/dvValidators");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const router = (0, express_1.Router)();
router.get('/get-all-tasks/:id', tasks_1.getTask);
router.post('/', [
    validar_jwt_1.default,
    validar_campos_1.default
], tasks_1.postTask);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], tasks_1.putTask);
router.delete('/:id', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist),
    (0, validar_roles_1.showRole)('ADMIN_ROLE', 'VENTAS_ROLE'),
], tasks_1.deleteTask);
router.get('/:projectId', tasks_1.getTasksByProject);
exports.default = router;
//# sourceMappingURL=tasksR.js.map