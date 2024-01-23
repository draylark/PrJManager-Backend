import { Response, Request } from 'express'
import bcryptjs from 'bcryptjs'
import User from '../models/userSchema';
import generarJWT from '../helpers/generarJWT';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { generatePAT } from '../helpers/generatePAT';
import nodemailer from 'nodemailer';

const usersPostLogin = async( req: Request, res: Response ) => {

    
    const { email, password } = req.body

    try {

        const user = await User.findOne( { email } )

        // ! verificar si el email existe

        if( !user ) return res.status(400).json({
                status: false,
                msg: 'El email o la password son incorrectos.'
            })

        
        // ! verificar si el usuario sigue activo en la db

        if(  !user.state  ) {
            return res.status(400).json({
                msg: 'La cuenta ya no existe o ha sido suspendida.',
            })
        }

        // ! verificar la password

        console.log(password)

        if(!user.password) return res.status(400).json({
            msg: 'El email o la password son incorrectos.'
        });

        const validPassword = bcryptjs.compareSync( password, user.password );
        if( !validPassword ) return res.status(400).json({
                msg: 'La password es incorrecta'
        })
            

        const tokenJWT = await generarJWT( user.id )

        res.json({
                status: true,
                user,
                tokenJWT
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }

};



const usersPostRegistration = async( req: Request, res: Response ) => {

    const { username, email, password, role } = req.body

    try {
        
        const user = new User({ username, email, password, role });
        const salt = bcryptjs.genSaltSync(10);
        user.password = bcryptjs.hashSync( password, salt );
        await user.save()


        const token = await generarJWT( user.id )

        res.json({
            status: true,
            token,
            user
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error',

        });
    }


};



const googlePostLogin = async( req: Request, res: Response ) => {

    const { email } = req.body

    try {

        const user = await User.findOne( { email } )

            // ! verificar si el email existe

            if( !user ) return res.status(400).json({
                    status: false,
                    msg: 'El email no esta registrado'
                })
 
            // ! verificar si el usuario sigue activo en la db
    
            // if(  !user.state  ) {
            //     return res.status(400).json({
            //         msg: 'La cuenta ya no existe o ha sido suspendida.',
            //     })
            // }
      

            const token = await generarJWT( user.id )

            res.json({
                    status: true,
                    token,
                    user 
            })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }

}
const googlePostRegistration = async( req: Request, res: Response ) => {

    const { email, username, photoUrl } = req.body


    console.log(username)
    try {

        const user = new User({ email, username, photoUrl })
        await user.save()
            // ! verificar si el email existe

            // if( !user ) return res.status(400).json({
            //         status: false,
            //         msg: 'El email no esta registrado'
            //     })
 
            // ! verificar si el usuario sigue activo en la db
    
            // if(  !user.state  ) {
            //     return res.status(400).json({
            //         msg: 'La cuenta ya no existe o ha sido suspendida.',
            //     })
            // }
      

            const token = await generarJWT( user.id )
            res.cookie('authToken', token, { httpOnly: true, secure: true });

            res.json({
                    status: true,
                    user,
                    token    
            })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }

}


const googleSignIn = async( req: Request, res: Response ) => {

    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        'postmessage'
    )

    try {

        const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
        console.log('tokensitos', tokens);
        

        const idToken = tokens.id_token
        if(typeof idToken !== 'string') return;

        const ticket = await oAuth2Client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID, 
        });

        const payload = (ticket as any).payload;


        res.json({
            payload, 
            idToken
        });

        
    } catch (error: any) {
        console.error('Error al autenticar con Google:', error.response?.data || error.message);
    }


};



const me = async(req: Request, res: Response ) => {

    // Verificar el estado del token

    res.json({
        state: true,
        user: req.authenticatedUser
    })

}


const extensionController = async(req: Request, res: Response) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne( { email } )

        // ! verificar si el email existe

        if( !user ) return res.status(400).json({
                status: false,
                msg: 'El email o la password son incorrectos.'
            })

        
        // ! verificar si el usuario sigue activo en la db

        if(  !user.state  ) {
            return res.status(400).json({
                msg: 'La cuenta ya no existe o ha sido suspendida.',
            })
        }

        // ! verificar la password

        if(!user.password) return res.status(400).json({
            msg: 'El email o la password son incorrectos.'
        });

        const validPassword = bcryptjs.compareSync( password, user.password );
        if( !validPassword ) return res.status(400).json({
                msg: 'La password es incorrecta'
        })
            

        const tokenJWT = await generarJWT( user.id )

        res.json({
                status: true,
                user,
                tokenJWT
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }
}

const extensionStartOAuth = async(req: Request, res: Response) => {
    const { type, socketID, port } = req.body;

    console.log('Type:', type, 'SocketID:', socketID, 'Port:', port);
    
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.EXTENSION_CLIENT_ID,
            process.env.EXTENSION_CLIENT_SECRET,
            process.env.EXTENSION_REDIRECT_URI
        );

        const scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ];

        const stateObj = {
            type: type || '',
            npmsocket: socketID || '',
            port: port || '',
            extraParam: 'state_parameter_passthrough_value'
        };
        const stateValue = JSON.stringify(stateObj);

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: stateValue,
            redirect_uri: process.env.EXTENSION_REDIRECT_URI
        });

        res.json({ url });

    } catch (error) {
        console.error('Error al iniciar la autenticación OAuth:', error);
        res.status(500).send('Error interno del servidor');
    }
}

const extensionAuthUser = async (req: Request, res: Response) => {

    try {

        const email = req.userEmail;

        const user = await User.findOne( { email } )

        if( !user ) return res.status(404).json({
                status: false,
                msg: 'The email is not registered, please register first.'
            })

        if( !user.state ) return res.status(403).json({
            status: false,
            msg: 'The account no longer exists or has been suspended.',
        })

        // console.log(user)
                

        const userPAT = generatePAT()
        user.personalAccessToken = userPAT;
        await user.save();
     

        res.status(200).json({
            status: true,
            user: {
                uid: user._id,
                email: user.email, // Solo enviar la información necesarias
                username: user.username,
                photoUrl: user.photoUrl,
            },
            pat: userPAT, // Personal Access Token
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        });
    }

};

export {

    googlePostRegistration,
    googleSignIn,
    googlePostLogin,
    usersPostRegistration,
    usersPostLogin,
    me,
    extensionController,
    extensionStartOAuth,
    extensionAuthUser
}

