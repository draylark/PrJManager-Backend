import { Router } from 'express';
import { validateJWT } from '../middlewares/validateJWT';
import * as commitsController from '../controllers/commits';
import { validateRepositoryExistance } from '../middlewares/DB-validators';
import { findCommit, getProjectCommitsBaseOnAccess } from '../middlewares/commits-middlewares';
import { validateUserAccessOnProject, validateProjectExistance } from '../middlewares/project-middlewares';


const router = Router()


router.get('/:repoID', commitsController.getCommitsByRepo);

router.get('/:repoID/diff/:hash', [ 
    validateRepositoryExistance, 
    findCommit ], commitsController.getCommitDiff);

router.get('/activity/:projectID', commitsController.getProyectCommits);

router.get('/repo-activity/:repoID', commitsController.getRepoCommits);

router.get('/get-commits-for-dashboard/:uid', commitsController.getCommitsForDashboard);

router.get('/activity-data/:projectID', [
    validateJWT,
    validateProjectExistance,
    validateUserAccessOnProject,
    getProjectCommitsBaseOnAccess ], commitsController.getProyectCommits);


export default router