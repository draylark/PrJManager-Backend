import { Router } from 'express';
import { usersPostRegistration, usersPostLogin, 
         googleSignIn, googlePostLogin, 
         googlePostRegistration, me, extensionController, extensionStartOAuth, extensionAuthUser, createToken, registerNewSession } from '../controllers/auths';
import { check } from 'express-validator'
import validarCampos from '../middlewares/validar-campos';
import { isEmailAlreadyExist } from '../middlewares/validar-db';
import validateCredentials from '../middlewares/validate-credentials';
import { validateJWT } from '../middlewares/validateJWT';

const router = Router()


router.post('/login', [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validarCampos
], usersPostLogin);


router.post('/register', [
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is Required').not().isEmpty(),
    check('password', 'Passaword needs to have at least 6 characters').isLength({ min: 6 }),
    check('email').custom( isEmailAlreadyExist ),
    validarCampos
], usersPostRegistration);



// Google

router.post('/glogin', [
    check('email', 'Email is not valid').isEmail(),
    validarCampos
], googlePostLogin);

router.post('/gregister', [
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is Required').not().isEmpty(),
    validarCampos
], googlePostRegistration);

router.post('/google', googleSignIn );


router.get('/gitlab-access-token', (req, res) => { 
    const accessToken = req.cookies['gitlabToken'];
    if (accessToken) {
      res.send(`El token de acceso es: ${accessToken}`);
    } else {
      res.status(400).send('No se encontró el token de acceso');
    }
} )



// State persistation

router.post('/me', validateJWT , me );

router.post('/extension', [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validarCampos
], extensionController );


router.post('/extension-oauth', extensionStartOAuth );

router.post('/extension-auth-user', [
    check('code', 'Code is required').not().isEmpty(),
    validateCredentials,
    validarCampos
],  extensionAuthUser );


router.post('/create-token', createToken)


router.get('/verify-token', validateJWT, (req, res) => {
    res.json({
        state: true,
        msg: 'Token valido'
    });
})

router.post('/new-session', registerNewSession )







export default router