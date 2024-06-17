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
const repoController = __importStar(require("../controllers/repos"));
const validateJWT_1 = require("../middlewares/auth/validateJWT");
const layer_middlewares_1 = require("../middlewares/layer/layer-middlewares");
const project_middlewares_1 = require("../middlewares/project/project-middlewares");
const collaborators_middlewares_1 = require("../middlewares/collaborators/collaborators-middlewares");
const repository_middlewares_1 = require("../middlewares/repository/repository-middlewares");
const router = (0, express_1.Router)();
// CRUD routes
router.post('/create-repository/:projectID/:layerID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    layer_middlewares_1.validateLayerExistance,
    (0, repository_middlewares_1.verifyTwoAccessLevelOfCollaborator)(['administrator', 'manager']),
    repository_middlewares_1.verifyLayerRepos,
    repository_middlewares_1.createRepoOnGitlab,
    repository_middlewares_1.createRepoOnMongoDB,
    collaborators_middlewares_1.addNewRepoCollaborators
], repoController.createRepository);
router.post('/updateRepos', repoController.updateRepos);
router.get('/:id', [], repoController.getRepositoryById);
router.get('/getAllRepos/:userId', repoController.getRepositoriesByUserId);
router.get('/get-repo-collaborators/:repoId', repoController.getRepoCollaborators);
router.get('/get-layer-repos/:projectID/:layerID', [validateJWT_1.validateJWT, project_middlewares_1.validateProjectExistance, project_middlewares_1.validateUserAccessOnProject, repository_middlewares_1.getLayerReposDataBaseOnAccess], repoController.getReposByLayer);
router.get('/get-repos/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    repository_middlewares_1.getProjectReposDataBaseOnAccess
], repoController.getReposByProject);
router.get('/get-top-profile-repos/:uid', repoController.getTopUserRepos);
router.put('/update-repository/:projectID/:layerID/:repoID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    layer_middlewares_1.validateLayerExistance,
    repository_middlewares_1.validateRepositoryExistance,
    (0, repository_middlewares_1.validateCollaboratorAccessOnRepository)(['administrator']),
    repository_middlewares_1.deleteCollaborators,
    repository_middlewares_1.updateRepoCollaborators,
    repository_middlewares_1.verifyProjectLevelAccessOfNewCollaborator,
    repository_middlewares_1.verifyLayerAccessLevelOfNewCollaborator,
    repository_middlewares_1.newCollaborators
], repoController.updateRepository);
router.delete('/:id', repoController.deleteRepository);
exports.default = router;
//# sourceMappingURL=reposR.js.map