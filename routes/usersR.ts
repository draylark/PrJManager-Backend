import { Router } from 'express';
import { check } from 'express-validator'
import * as uController from '../controllers/users';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';


const router = Router()


router.post('/', uController.getUsers);

router.get('/find-user', uController.findUsers)

router.get('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], uController.getUsersById);



router.put('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], uController.putUsers);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist ),
    showRole('ADMIN_ROLE', 'VENTAS_ROLE'),
], uController.deleteUsers);







export default router