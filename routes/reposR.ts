import { Router } from 'express';
import * as repoController from '../controllers/repos';
import { validateJWT } from '../middlewares/validateJWT';
import { validateLayerExistance } from '../middlewares/layer-middlewares';
import { validateProjectExistance, ownerOrCollaborator, validateUserAccessOnProject } from '../middlewares/project-middlewares';
import { addNewRepoCollaborators } from '../middlewares/collaborators-middlewares';
import { createRepoOnGitlab, createRepoOnMongoDB, validateCollaboratorAccessOnRepository, verifyTwoAccessLevelOfNewCollaborator, validateRepositoryExistance, 
    updateRepoCollaborators, newCollaborators, deleteCollaborators, getProjectReposDataBaseOnAccess } from '../middlewares/repository-middlewares';

const router = Router();
// CRUD routes

router.post('/', 
    [
        validateJWT,
        validateProjectExistance,
        validateLayerExistance,
        createRepoOnGitlab,
        createRepoOnMongoDB,
        addNewRepoCollaborators,
    ], 
    repoController.createRepository
);

router.get('/', repoController.getRepositories);
router.get('/:id', repoController.getRepositoryById);
router.put('/:id', repoController.updateRepository);
router.delete('/:id', repoController.deleteRepository);

// Get all repositories by user ID

router.get('/getAllRepos/:userId', repoController.getRepositoriesByUserId);
router.get('/get-repo-collaborators/:repoId', repoController.getRepoCollaborators);
router.post('/updateRepos', repoController.updateRepos);
router.post('/add-repo-collaborator/:projectId', [ 
    validateJWT, 
    // showRole('manager', 'administrator'),
    // validarCampos 
], repoController.addRepoCollaborator);



router.put('/update-repository/:projectID/:layerID/:repoID', 
    [
        validateJWT,
        validateProjectExistance,
        validateLayerExistance,
        validateRepositoryExistance,
        validateCollaboratorAccessOnRepository(['administrator']),
        deleteCollaborators,
        updateRepoCollaborators,
        verifyTwoAccessLevelOfNewCollaborator,
        newCollaborators

        
    ],
    repoController.updateRepository)



router.get('/get-repos/:projectID', 
    [
        validateJWT,
        validateProjectExistance,
        validateUserAccessOnProject,
        getProjectReposDataBaseOnAccess
    ],
    repoController.getReposByProject 
);





// Donde se encontraba antes: 
// router.get('/getAllRepos/:userId', getRepositoriesByUserId);




export default router;
