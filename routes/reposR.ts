import { Router } from 'express';
import { createRepository, getRepositories, getRepositoryById, updateRepository, deleteRepository, getRepositoriesByUserId, updateRepos, getRepoCollaborators } from '../controllers/repos';

const router = Router();


// CRUD routes

router.post('/', createRepository);
router.get('/', getRepositories);
router.get('/:id', getRepositoryById);
router.put('/:id', updateRepository);
router.delete('/:id', deleteRepository);

// Get all repositories by user ID

router.get('/getAllRepos/:userId', getRepositoriesByUserId);
router.get('/getCollaborators/:repoId', getRepoCollaborators);
router.post('/updateRepos', updateRepos);






// Donde se encontraba antes: 
// router.get('/getAllRepos/:userId', getRepositoriesByUserId);




export default router;
