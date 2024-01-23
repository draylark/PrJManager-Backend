
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

// 34259062200++123
// huh93320803++
const validarCampos = ( req: Request, res: Response, next: NextFunction ) => {

    const errors = validationResult(req);

    if( !errors.isEmpty()){
        return res.status(400).json(errors)
    }

    next()
}


export default validarCampos