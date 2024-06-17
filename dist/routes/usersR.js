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
const express_validator_1 = require("express-validator");
const uController = __importStar(require("../controllers/users"));
const dvValidators_1 = require("../helpers/dvValidators");
const project_middlewares_1 = require("../middlewares/project/project-middlewares");
const commits_middlewares_1 = require("../middlewares/commit/commits-middlewares");
const tasks_middlewares_1 = require("../middlewares/tasks/tasks-middlewares");
const layer_middlewares_1 = require("../middlewares/layer/layer-middlewares");
const repository_middlewares_1 = require("../middlewares/repository/repository-middlewares");
const helpers_middlewares_1 = require("../middlewares/others/helpers-middlewares");
const validateJWT_1 = require("../middlewares/auth/validateJWT");
const router = (0, express_1.Router)();
router.post('/', uController.getUsers);
router.get('/find-user', uController.findUsers);
router.get('/get-users-relation', uController.getUsersRelation);
router.get('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], uController.getUsersById);
router.get('/get-profile/:uid', uController.getProfile);
// ? User Activity
router.get('/my-monthly-activity/:uid', [
    project_middlewares_1.getProjectsLength,
    commits_middlewares_1.getCommitsLength,
    tasks_middlewares_1.getCompletedTasksLength
], uController.getMyMonthlyActivity);
router.get('/timeline-activity/:uid', [
    // validateJWT,
    project_middlewares_1.getCreatedProjectsDates,
    layer_middlewares_1.getCreatedLayersDates,
    repository_middlewares_1.getCreatedReposDates,
    commits_middlewares_1.getCommitsDates,
    tasks_middlewares_1.getTasksDates,
    helpers_middlewares_1.handleAndOrganizeData
], uController.getTimelineActivity);
router.get('/project-timeline-activity/:projectId', [
    layer_middlewares_1.getProjectCreatedLayersDates,
    repository_middlewares_1.geProjectCreatedReposDates,
    commits_middlewares_1.getProjectCommitsDates,
    tasks_middlewares_1.getProjectTasksDates,
    helpers_middlewares_1.handleAndOrganizeProjectData
], uController.getProjectTimelineActivity);
router.get('/get-followers-length/:uid', uController.getFollowersLength);
router.put('/update-top-projects/:uid', [validateJWT_1.validateJWT], uController.updateUserTopProjects);
// ? User Friends
router.get('/get-profile-followers-following/:profileUID', uController.getProfileFollowersFollowing);
router.get('/get-fll-flly-friends/:uid', uController.getFollowersAndFollowingFriends);
router.get('/get-fll/:profileUID', uController.getFollowers);
router.get('/get-flly/:profileUID', uController.getFollowing);
router.get('/get-friends/:uid', uController.getFriends);
router.post('/follow-profile', uController.followProfile);
router.delete('/unfollow-profile/:profileUID', uController.unfollowProfile);
router.delete('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist),
], uController.deleteUsers);
router.put('/update-my-links/:uid', uController.updateMyLinks);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], uController.putUsers);
exports.default = router;
//# sourceMappingURL=usersR.js.map