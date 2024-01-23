import { Router } from 'express';
import { check } from 'express-validator'
import { getNotisbyUserId, postNoti, putNoti, deleteNoti } from '../controllers/notis';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';


const router = Router()


router.get('/:id', getNotisbyUserId);

router.post('/', postNoti);

router.put('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], putNoti);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist ),
    showRole('ADMIN_ROLE', 'VENTAS_ROLE'),
], deleteNoti);




export default router