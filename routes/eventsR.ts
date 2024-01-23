import { Router } from 'express';
import { check } from 'express-validator'
import { postEvent, getEvents } from '../controllers/events';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';
import validarCampos from '../middlewares/validar-campos';


const router = Router()


router.post('/',[
    validarJWT,
    validarCampos
], postEvent);

router.get('/:userId', getEvents);





export default router