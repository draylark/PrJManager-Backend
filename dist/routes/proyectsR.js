"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projects_1 = require("../controllers/projects");
const express_validator_1 = require("express-validator");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const dvValidators_1 = require("../helpers/dvValidators");
const router = (0, express_1.Router)();
router.post('/create-proyect', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('name', 'Name is Required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Description is Required').not().isEmpty(),
    (0, express_validator_1.check)('owner', 'Owner is Required').not().isEmpty(),
    validar_campos_1.default
], projects_1.postProyect);
router.get('/get-proyect', projects_1.getProyect);
router.put('/update-proyect/:id', projects_1.putProyect);
router.delete('/delete-proyect/:id', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('id', 'It is not a valid MongoId').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isPrIdExist),
    validar_campos_1.default
], projects_1.deleteProyect);
exports.default = router;
//# sourceMappingURL=proyectsR.js.map