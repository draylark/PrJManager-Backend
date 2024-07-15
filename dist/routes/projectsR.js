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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prjController = __importStar(require("../controllers/projects"));
const express_validator_1 = require("express-validator");
const dvValidators_1 = require("../helpers/dvValidators");
const validateJWT_1 = require("../middlewares/auth/validateJWT");
const project_middlewares_1 = require("../middlewares/project/project-middlewares");
const router = (0, express_1.Router)();
router.post('/create-project', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateUserProjects,
    project_middlewares_1.createProject
], prjController.postProject);
router.get('/get-project/:userId', prjController.getProject);
router.get('/get-project-by-id/:projectID', [
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.validateUserAccessBaseOnProjectVisibility
], prjController.getProjectById);
router.get('/get-projects/:uid', prjController.getProjects);
router.get('/get-profile-public-projects/:uid', prjController.getProfilePublicProjects);
router.get('/get-profile-top-projects/:uid', prjController.getProfileTopProjects);
router.get('/collaborators/:projectID', prjController.getCollaborators);
router.get('/readme/:readmeID', prjController.getReadme);
router.get('/timeline-activity/:projectId', prjController.getMyProjectTimelineActivity);
router.put('/update-project/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.itIsTheOwner
], prjController.updateProject);
router.put('/collaborators/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    (0, project_middlewares_1.validateCollaboratorAccessOnProject)(['administrator']),
    project_middlewares_1.deleteCollaborators,
    project_middlewares_1.updateOtherCollaboratorDataOfDeletedCollaborators,
    project_middlewares_1.updateCollaborators,
    project_middlewares_1.updateOtherCDataOfProjectModifiedCollaborators,
    project_middlewares_1.newCollaborators
], prjController.response);
router.put('/handle-invitation/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.handlePrJCollaboratorInvitation,
    project_middlewares_1.createOtherCDataOfProjectCreatedCollaborators
], prjController.prjInvitationCallback);
router.delete('/delete-project/:id', [
    (0, express_validator_1.check)('id', 'It is not a valid MongoId').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isPrIdExist),
], prjController.deleteProject);
exports.default = router;
//# sourceMappingURL=projectsR.js.map