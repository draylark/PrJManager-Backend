import { Response, Request, NextFunction } from 'express'
import cookieParse  from 'cookie-parser'
import User from '../models/userSchema';
import jwt, { JwtPayload } from 'jsonwebtoken'


interface MyJwtPayload extends JwtPayload {
    uid: string;
    // otros campos aquí
  }


const validarJWT = async( req: Request, res: Response, next: NextFunction ) => {

    const token = req.headers['authorization'];

    if( !token ){
        return res.status(400).json({
            state: false,
            msg: 'No hay token un token valido en la peticion'
        });
    }

    if( token === undefined ){
        return res.status(400).json({
            state: false,
            msg: 'No hay token un token valido en la peticion'
        });
    }

    try {
        
        if( !process.env.SECRETORPRIVATEKEY ) return res.status(400).json({ msg: 'Enviroment variable has not been set'})

        const response = jwt.verify( token, process.env.SECRETORPRIVATEKEY ) as MyJwtPayload
        const user = await User.findById( response.uid )


        // console.log(response)
        console.log(user)

         // ! verificar que el user exista
         if( !user ) return res.status(401).json({
                state: false,
                msg: 'El usuario no existe'
            });
            

        // console.log(user)

        // ! verificar si el estado de usuario es true
        // if( !user.state ) return res.status(401).json({
        //         msg: 'Token no valido / Usuario no autorizado'
        // });

        req.authenticatedUser = user
        req.uid =  response.uid
        
        next()

    } catch (error) {
        return res.status(401).json({
            state: false,
            msg: 'Token no valido'
        });

    }

};

export default validarJWT
