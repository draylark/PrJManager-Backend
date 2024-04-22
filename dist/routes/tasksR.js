"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const tasksController = __importStar(require("../controllers/tasks"));
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_roles_1 = require("../middlewares/validar-roles");
const dvValidators_1 = require("../helpers/dvValidators");
const DB_validators_1 = require("../middlewares/DB-validators");
const validateJWT_1 = require("../middlewares/validateJWT");
const project_middlewares_1 = require("../middlewares/project-middlewares");
const project_middlewares_2 = require("../middlewares/project-middlewares");
const tasks_middlewares_1 = require("../middlewares/tasks-middlewares");
const router = (0, express_1.Router)();
router.get('/get-all-tasks/:id', tasksController.getTask);
router.post('/:projectID/:layerID/:repoID', [], tasksController.createNewTask);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], tasksController.putTask);
router.delete('/:id', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist),
    (0, validar_roles_1.showRole)('ADMIN_ROLE', 'VENTAS_ROLE'),
], tasksController.deleteTask);
router.get('/:repoID', [validateJWT_1.validateJWT, DB_validators_1.validateRepositoryExistance], tasksController.getTasksByRepo);
router.get('/activity/:projectID', [validateJWT_1.validateJWT, project_middlewares_2.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    tasks_middlewares_1.getProjectTasksBaseOnAccessForHeatMap
], tasksController.getProyectTasksDataForHeatMap);
router.get('/activity-data/:projectID', [validateJWT_1.validateJWT, project_middlewares_2.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    tasks_middlewares_1.getProjectTasksBaseOnAccess
], tasksController.getTasksByProject);
router.put('/update-task-status/:projectID/:taskId', [
    validateJWT_1.validateJWT,
    project_middlewares_2.validateProjectExistance,
    (0, tasks_middlewares_1.validateCollaboratorAccess)(['coordinator', 'administrator'])
], tasksController.updateTaskStatus);
exports.default = router;
//# sourceMappingURL=tasksR.js.map