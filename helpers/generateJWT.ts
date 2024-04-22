import jwt from 'jsonwebtoken'
import path from 'path'
import { readFileSync } from 'fs';



export const generateJWT = ( uid: string, state: boolean ) => {

    return new Promise<string>(( resolve, reject ) => {

        const payload = { uid, state };

        const privateKeyPath = path.join(process.cwd(), 'keys', 'private_key.pem')
        const privateKey = readFileSync(privateKeyPath, 'utf8');

        if (!privateKey) {
            throw new Error('SECRET_KEY environment is not defined');
        }

        jwt.sign( 

            payload,  
            privateKey, 
            { algorithm: 'RS256', expiresIn: "5hr" },
            ( err, token ) => {
                if( err ){
                console.log(err) 
                reject( 'No se pudo generar el token')
                } else {
                    if(!token) return 
                    resolve( token )
                }
            }
            
        );

    });

};