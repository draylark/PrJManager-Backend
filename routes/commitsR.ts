import { Router } from 'express';
import { check } from 'express-validator'
import * as tasksController from '../controllers/tasks';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';
import validarCampos from '../middlewares/validar-campos';
import { validateRepositoryExistance } from '../middlewares/DB-validators';
import { validateJWT } from '../middlewares/validateJWT';
import { findCommit, getProjectCommitsBaseOnAccess } from '../middlewares/commits-middlewares';
import * as commitsController from '../controllers/commits';
import { validateUserAccessOnProject, validateProjectExistance } from '../middlewares/project-middlewares';
import { validateJWT } from '../middlewares/validateJWT';

const router = Router()


router.get('/:repoID', [ validateJWT, validateRepositoryExistance ], commitsController.getCommitsByRepo);

router.get('/:repoID/diff/:hash', [ validateJWT, validateRepositoryExistance, findCommit ], commitsController.getCommitDiff);

router.get('/activity/:projectID', commitsController.getProyectCommits);

router.get('/activity-data/:projectID', [
    validateJWT,
    validateProjectExistance,
    validateUserAccessOnProject,
    getProjectCommitsBaseOnAccess
], commitsController.getProyectCommits);

export default router