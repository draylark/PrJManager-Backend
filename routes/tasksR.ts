import { Router } from 'express';
import { check } from 'express-validator'
import * as tasksController from '../controllers/tasks';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';
import validarCampos from '../middlewares/validar-campos';
import { validateRepositoryExistance } from '../middlewares/DB-validators';
import { validateJWT } from '../middlewares/validateJWT';
import { validateUserAccessOnProject } from '../middlewares/project-middlewares';
import { validateProjectExistance } from '../middlewares/project-middlewares';
import { getProjectTasksBaseOnAccess, getProjectTasksBaseOnAccessForHeatMap } from '../middlewares/tasks-middlewares';

const router = Router()


router.get('/get-all-tasks/:id', tasksController.getTask);

router.post('/', [
], tasksController.createNewTask);

router.put('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], tasksController.putTask);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist ),
    showRole('ADMIN_ROLE', 'VENTAS_ROLE'),
], tasksController.deleteTask);

router.get('/:repoID', [ validateJWT, validateRepositoryExistance ], tasksController.getTasksByRepo);

router.get('/activity/:projectID',[ validateJWT, validateProjectExistance,
                                    validateUserAccessOnProject, 
                                    getProjectTasksBaseOnAccessForHeatMap  
                                  ], tasksController.getProyectTasksDataForHeatMap);

router.get('/activity-data/:projectID', [ validateJWT, validateProjectExistance, 
                                          validateUserAccessOnProject, 
                                          getProjectTasksBaseOnAccess 
                                        ], tasksController.getTasksByProject);



export default router