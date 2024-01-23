
import { Request, Response, NextFunction } from "express"


const clientValidator = (req: Request, res: Response, next: NextFunction) => {


    const { firstName, lastName, email, phoneNumber, address, notes } = req.body


    if (firstName.length < 2) return res.status(400).json({
            msg: 'firstName must be at least 3 characters'
    })

    
    if (lastName.length < 2) return res.status(400).json({
            msg: 'lastName must be at least 3 characters'
    })


    if (email.length < 3) return res.status(400).json({
            msg: 'email must be at least 3 characters'
    })


    if (phoneNumber.length < 3) return res.status(400).json({
            msg: 'phoneNumber must be at least 3 characters'
    })

    next()

}


export default clientValidator