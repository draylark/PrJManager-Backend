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
const validateJWT_1 = require("../middlewares/validateJWT");
const commitsController = __importStar(require("../controllers/commits"));
const DB_validators_1 = require("../middlewares/DB-validators");
const commits_middlewares_1 = require("../middlewares/commits-middlewares");
const project_middlewares_1 = require("../middlewares/project-middlewares");
const router = (0, express_1.Router)();
router.get('/:repoID', commitsController.getCommitsByRepo);
router.get('/:repoID/diff/:hash', [
    DB_validators_1.validateRepositoryExistance,
    commits_middlewares_1.findCommit
], commitsController.getCommitDiff);
router.get('/activity/:projectID', commitsController.getProyectCommits);
router.get('/repo-activity/:repoID', commitsController.getRepoCommits);
router.get('/get-commits-for-dashboard/:uid', commitsController.getCommitsForDashboard);
router.get('/activity-data/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    commits_middlewares_1.getProjectCommitsBaseOnAccess
], commitsController.getProyectCommits);
exports.default = router;
//# sourceMappingURL=commitsR.js.map