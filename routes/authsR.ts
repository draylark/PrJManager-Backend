import { Router } from 'express';
import { usersPostRegistration, usersPostLogin, 
         googleSignIn, googlePostLogin, 
         googlePostRegistration, me, extensionController, extensionStartOAuth, extensionAuthUser, createToken, registerNewSession } from '../controllers/auths';
import { check } from 'express-validator'
import { fieldValidator, validateCredentials } from '../middlewares/auth/auth-middlewares';

import { validateJWT } from '../middlewares/auth/validateJWT';

const router = Router()


router.post('/login', [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    fieldValidator
], usersPostLogin);


router.post('/register', [
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is Required').not().isEmpty(),
    check('password', 'Passaword needs to have at least 6 characters').isLength({ min: 6 }),
    fieldValidator
], usersPostRegistration);



// Google

router.post('/glogin', [
    check('email', 'Email is not valid').isEmail(),
    fieldValidator
], googlePostLogin);

router.post('/gregister', [
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is Required').not().isEmpty(),
    fieldValidator
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
    fieldValidator
], extensionController );


router.post('/extension-oauth', extensionStartOAuth );

router.post('/extension-auth-user', [
    check('code', 'Code is required').not().isEmpty(),
    validateCredentials,
    fieldValidator
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