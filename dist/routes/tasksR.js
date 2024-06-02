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
const tasksController = __importStar(require("../controllers/tasks"));
const DB_validators_1 = require("../middlewares/DB-validators");
const validateJWT_1 = require("../middlewares/validateJWT");
const project_middlewares_1 = require("../middlewares/project-middlewares");
const project_middlewares_2 = require("../middlewares/project-middlewares");
const commits_middlewares_1 = require("../middlewares/commits-middlewares");
const tasks_middlewares_1 = require("../middlewares/tasks-middlewares");
const repository_middlewares_1 = require("../middlewares/repository-middlewares");
const router = (0, express_1.Router)();
router.get('/:repoID', [
    validateJWT_1.validateJWT,
    DB_validators_1.validateRepositoryExistance
], tasksController.getTasksByRepo);
router.get('/:taskId', tasksController.getTaskById);
router.get('/get-task-contributors/:taskId', [tasks_middlewares_1.getTaskContributors, commits_middlewares_1.getContributorsCommits], tasksController.getTaskContributors);
router.get('/get-task-notes/:taskId', tasksController.getTaskNotes);
router.get('/get-task-commits/:taskId', [tasks_middlewares_1.getTaskData, commits_middlewares_1.getCommits], tasksController.getTaskCommits);
router.get('/get-all-tasks/:id', tasksController.getTasks);
router.get('/activity/:projectID', [
    project_middlewares_2.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    tasks_middlewares_1.getProjectTasksBaseOnAccessForHeatMap
], tasksController.getProyectTasksDataForHeatMap);
router.get('/activity-data/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_2.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    tasks_middlewares_1.getProjectTasksBaseOnAccess
], tasksController.getTasksByProject);
router.get('/get-profile-tasks/:uid', [tasks_middlewares_1.getProfileTasksFiltered], tasksController.getProfileTasks);
router.get('/get-user-tasks/:uid', [validateJWT_1.validateJWT], tasksController.getUserTasks);
router.get('/top-projects-tasks/:uid', [validateJWT_1.validateJWT], tasksController.getTopProjectsTasks);
router.get('/get-tasks-for-dashboard/:uid', [validateJWT_1.validateJWT], tasksController.getTasksForDashboard);
router.get('/repo-activity/:repoID', tasksController.getRepoTasksDataForHeatMap);
router.post('/:projectID/:layerID/:repoID', [
    validateJWT_1.validateJWT,
    project_middlewares_2.validateProjectExistance,
    repository_middlewares_1.validateRepositoryExistance,
    (0, tasks_middlewares_1.validateCollaboratorAccess)(['coordinator', 'administrator'])
], tasksController.createNewTask);
router.put('/update-task-status/:projectID/:taskId', [
    validateJWT_1.validateJWT,
    project_middlewares_2.validateProjectExistance,
    (0, tasks_middlewares_1.validateCollaboratorAccess)(['coordinator', 'administrator'])
], tasksController.updateTaskStatus);
router.put('/handle-task-invitation/:taskId', tasksController.handleTaskInvitation);
router.put('/update-participation/:taskId', [tasks_middlewares_1.updateParticipation], tasksController.sendTaskToRevision);
router.put('/update-note/:noteId', tasksController.updateNote);
router.put('/update-task-contributors/:taskId', tasksController.updateTaskContributors);
router.put('/delete-task-contributor/:taskId', tasksController.deleteTaskContributor);
router.delete('/delete-note/:noteId', tasksController.deleteNote);
exports.default = router;
//# sourceMappingURL=tasksR.js.map