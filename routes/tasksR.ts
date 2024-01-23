import { Router } from 'express';
import { check } from 'express-validator'
import { getTask, putTask, deleteTask, postTask, getTasksByProject } from '../controllers/tasks';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';
import validarCampos from '../middlewares/validar-campos';


const router = Router()


router.get('/get-all-tasks/:id', getTask);

router.post('/', [
    validarJWT,
    validarCampos
], postTask);

router.put('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], putTask);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist ),
    showRole('ADMIN_ROLE', 'VENTAS_ROLE'),
], deleteTask);

router.get('/:projectId', getTasksByProject);




export default router