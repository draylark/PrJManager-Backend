import { Response, Request, NextFunction } from 'express'
import cookieParse  from 'cookie-parser'
import User from '../models/userSchema';
import jwt, { JwtPayload } from 'jsonwebtoken'
import path from 'path'
import { readFileSync } from 'fs';



interface MyJwtPayload extends JwtPayload {
    uid: string;
    state: boolean;
  }


export const validateJWT = async( req: Request, res: Response, next: NextFunction ) => {

    const token = req.headers['authorization'];

    if( !token ){
        return res.status(400).json({
            state: false,
            message: 'No hay token un token valido en la peticion'
        });
    }

    if( token === undefined ){
        return res.status(400).json({
            state: false,
            message: 'No hay token un token valido en la peticion'
        });
    }

    try {
        
        const publicKeyPath = path.join(process.cwd(), 'keys', 'public_key.pem')
        const publicKey = readFileSync(publicKeyPath, 'utf8');
        
        if( !publicKey) return res.status(400).json({ msg: 'Enviroment variable has not been set'})
        const response = jwt.verify( token, publicKey, { algorithms: ['RS256'] }  ) as MyJwtPayload


        const user = await User.findById( response.uid )
        if( !user ) return res.status(401).json({
                state: false,
                message: 'The user does not exist'
        });
        

        req.authenticatedUser = user
        req.user = user
        req.uid =  response.uid
        
        next()

    } catch (error) {
        return res.status(401).json({
            state: false,
            message: 'Token not valid / User not authorized'
        });

    }

};
