"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repos_1 = require("../controllers/repos");
const router = (0, express_1.Router)();
// CRUD routes
router.post('/', repos_1.createRepository);
router.get('/', repos_1.getRepositories);
router.get('/:id', repos_1.getRepositoryById);
router.put('/:id', repos_1.updateRepository);
router.delete('/:id', repos_1.deleteRepository);
// Get all repositories by user ID
router.get('/getAllRepos/:userId', repos_1.getRepositoriesByUserId);
router.get('/getCollaborators/:repoId', repos_1.getRepoCollaborators);
router.post('/updateRepos', repos_1.updateRepos);
// Donde se encontraba antes: 
// router.get('/getAllRepos/:userId', getRepositoriesByUserId);
exports.default = router;
//# sourceMappingURL=reposR.js.map