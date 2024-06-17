
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { google } from 'googleapis';



interface GooglePeopleResponse {
    data: {
        emailAddresses?: [{ value: string }];
    }
}


export const fieldValidator = ( req: Request, res: Response, next: NextFunction ) => {

    const errors = validationResult(req);

    if( !errors.isEmpty()){
        return res.status(400).json(errors)
    }

    next()
}


export const validateCredentials = async( req: Request, res: Response, next: NextFunction ) => {

    const code = req.body.code


    if( !code ){
        return res.status(400).json({
            state: false,
            msg: 'No hay un codigo valido en la peticion'
        });
    }

    try {

        const oAuth2Client = new google.auth.OAuth2(
            process.env.EXTENSION_CLIENT_ID,
            process.env.EXTENSION_CLIENT_SECRET,
            process.env.EXTENSION_REDIRECT_URI
        );

        // Intercambiar el código por tokens
        const { tokens } = await oAuth2Client.getToken(code);

        // Ahora puedes usar estos tokens para hacer solicitudes a la API de Google
        oAuth2Client.setCredentials(tokens);

        // Aquí puedes manejar los tokens como necesites

        const people = google.people({ version: 'v1', auth: oAuth2Client });
        const me = await people.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses',
        }) as GooglePeopleResponse;

        if (me.data.emailAddresses && me.data.emailAddresses.length > 0) {
            const email = me.data.emailAddresses[0].value;
            req.userEmail = email;
            next();
        } else {
            res.status(404).json({ message: 'Email not found' });
        }
    } catch (error) {
        console.error('Error al intercambiar el código por tokens:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

};