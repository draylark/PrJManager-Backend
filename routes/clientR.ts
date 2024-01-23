import { Router } from "express";
import { postClient, getClient } from "../controllers/clients";
import { check } from "express-validator";
import { isIdExist } from "../helpers/dvValidators";
import validarCampos from "../middlewares/validar-campos";
import validarJWT from "../middlewares/validar-jwt";
import clientValidator from "../middlewares/client-validator";

const router = Router()

router.post('/', [
    validarJWT,
    clientValidator,
    check('email', 'Not a valid Email').isEmail(),
    check('phoneNumber', 'Not a valid Phone Number').isMobilePhone('any'),
    validarCampos
], postClient);

router.get('/:userId', [

], getClient);

router.put('/');


router.delete('/');



export default router