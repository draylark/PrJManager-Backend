import { Request, Response, NextFunction } from "express"

const showRole = ( ...roles: [ string, string ] ) => {

    return ( req: Request, res: Response, next: NextFunction ) => {

        const [ ADMIN, VENTAS ] = roles

        console.log(ADMIN, VENTAS)

        if( !req.authenticatedUser ) return res.status(500).json({
            msg: 'Se require enviar un token valido para autenticar el rol'
        })

        if( !roles.includes( req.authenticatedUser.role ) ) return res.status(401).json({
            msg: `No posee las credenciales para ejecutar esta accion, se require uno de los siguientes roles: ${roles}`
        })

        next()

    }

}

export {
    showRole
}