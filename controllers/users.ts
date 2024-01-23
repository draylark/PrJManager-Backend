import { Response, Request } from 'express'
import User from '../models/userSchema';
import bcryptjs from 'bcryptjs'


const getUsers = async( req: Request, res: Response ) => {

    const { limit = 5, from = 0 } = req.query

    const [ total, users ] = await Promise.all([

        User.countDocuments({ state: true }), 
        User.find({ state: true })
        .skip( from )
        .limit( limit )

    ]);

    res.json({
        msg: 'get API - c',
        total, 
        users 
    });

}; 



const getUsersById = async( req: Request, res: Response ) => {

    const { id } = req.params


    try {

        const user = await User.findOne( { _id: id, state: true } )

        if(!user) return res.status(400).json({
            msg: 'User not found'
        })

        res.json({
            user
        })

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error'
        })
    }


}; 



const putUsers = async( req: Request, res: Response ) => {

    const { id } = req.params
    const { _id, password, google, ...resto } = req.body


    try {

        if( password ){
            const salt = bcryptjs.genSaltSync(10);
            resto.password = bcryptjs.hashSync( password, salt );
        }

        const user = await User.findByIdAndUpdate( id, resto )

        res.json({
            user
        })

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error',
            error
        })
    }


}; 



const deleteUsers = async( req: Request, res: Response ) => {

    const { id } = req.params
    const { authenticatedUser } = req
    const user = await User.findByIdAndUpdate( id, { state: false } );

    return res.json({
        user,
        authenticatedUser
    });

}; 




export {
    getUsers,
    getUsersById,
    putUsers,
    deleteUsers
}