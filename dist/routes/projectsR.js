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
const prjController = __importStar(require("../controllers/projects"));
const express_validator_1 = require("express-validator");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const dvValidators_1 = require("../helpers/dvValidators");
const validateJWT_1 = require("../middlewares/validateJWT");
const project_middlewares_1 = require("../middlewares/project-middlewares");
const router = (0, express_1.Router)();
router.post('/create-project', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('name', 'Name is Required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Description is Required').not().isEmpty(),
    (0, express_validator_1.check)('owner', 'Owner is Required').not().isEmpty(),
    validar_campos_1.default
], prjController.postProject);
router.get('/get-project/:userId', prjController.getProject);
router.get('/get-project-by-id/:projectId', prjController.getProjectById);
router.get('/get-projects/:uid', prjController.getProjects);
router.put('/update-project/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.itIsTheOwner
], prjController.updateProject);
router.delete('/delete-project/:id', [
    validar_jwt_1.default,
    (0, express_validator_1.check)('id', 'It is not a valid MongoId').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isPrIdExist),
    validar_campos_1.default
], prjController.deleteProject);
router.get('/collaborators/:projectID', prjController.getCollaborators);
router.put('/collaborators/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    (0, project_middlewares_1.validateCollaboratorAccessOnProject)(['administrator']),
    project_middlewares_1.deleteCollaborators,
    project_middlewares_1.updateOtherCollaboratorDataOfDeletedCollaborators,
    project_middlewares_1.updateCollaborators,
    project_middlewares_1.updateOtherCDataOfProjectModifiedCollaborators,
    project_middlewares_1.newCollaborators,
    // createOtherCDataOfProjectCreatedCollaborators
], prjController.response);
router.put('/handle-invitation/:projectID', [validateJWT_1.validateJWT, project_middlewares_1.validateProjectExistance,
    project_middlewares_1.handlePrJCollaboratorInvitation, project_middlewares_1.createOtherCDataOfProjectCreatedCollaborators], prjController.response);
router.get('/readme/:readmeID', prjController.getReadme);
exports.default = router;
//# sourceMappingURL=projectsR.js.map