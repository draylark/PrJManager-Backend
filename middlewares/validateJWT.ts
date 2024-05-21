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


  export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(400).json({
            state: false,
            success: false,
            message: 'There is no valid token in the request',
            type: 'no-token'
        });
    }

    try {
        const publicKeyPath = path.join(process.cwd(), 'keys', 'public_key.pem');
        const publicKey = readFileSync(publicKeyPath, 'utf8');

        if (!publicKey) {
            return res.status(500).json({
                message: 'Public key not found',
                type: 'server-error'
            });
        }

        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as MyJwtPayload;

        const user = await User.findById(decoded.uid).populate({
            path: 'topProjects',
            select: '_id name'
        });

        if (!user) {
            return res.status(401).json({
                state: false,
                success: false,
                message: 'The user does not exist',
                type: 'user-validation'
            });
        }

        req.authenticatedUser = user;
        req.user = user
        req.uid = decoded.uid;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            // Catch JWT specific errors
            return res.status(401).json({
                state: false,
                success: false,
                message: 'The access token is not valid or your session has ended, restart the page and log in again.',
                type: 'token-validation'
            });
        }
        // Other errors (e.g., DB access issues, file read errors)
        console.error('Server Error:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            type: 'server-error'
        });
    }
};

// export const validateJWT = async( req: Request, res: Response, next: NextFunction ) => {

//     const token = req.headers['authorization'];


//     if( !token ){
//         return res.status(400).json({
//             state: false,
//             success: false,
//             message: 'There is no valid token in the request',
//             type: 'no-token'
//         });
//     }


    
//     try {
        
//         const publicKeyPath = path.join(process.cwd(), 'keys', 'public_key.pem')
//         const publicKey = readFileSync(publicKeyPath, 'utf8');
        
//         if( !publicKey) return res.status(400).json({ msg: 'Enviroment variable has not been set'})
//         const response = jwt.verify( token, publicKey, { algorithms: ['RS256'] }  ) as MyJwtPayload


//         const user = await User.findById( response.uid )
//                             .populate({
//                                 path: 'topProjects',
//                                 select: '_id name'
//                             })
                            
//         if( !user ) return res.status(401).json({
//                 state: false,
//                 success: false,
//                 message: 'The user does not exist',
//                 type: 'user-validation'
//         });
        

//         req.authenticatedUser = user
//         req.user = user
//         req.uid =  response.uid
        
//         next()

//     } catch (error) {
//         return res.status(401).json({
//             state: false,
//             success: false,
//             message: 'The access token is not valid or your session has ended, restart the page and log in again.',
//             type: 'token-validation'
//         });

//     }
// };
