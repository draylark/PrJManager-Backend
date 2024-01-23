import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import Client from '../models/clientSchema';
import User from '../models/userSchema';

interface IAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  interface IClientData {
    _id: ObjectId;
    __v: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: IAddress;
    notes: string[];
    // ...otros campos
  }
  
  interface IUser {
    clients: IClientData[];
    // ...otros campos
  }
  
  interface ITransformedClientData extends Omit<IClientData, '_id' | '__v'> {
    cid: ObjectId;
  }

export const postClient = async(req: Request, res: Response) => {

    try {

        const client = new Client(req.body);
        await client.save();


        const updatedUser = await User.findByIdAndUpdate( 
            req.uid,
            { $push: { clients: client._id } }, 
            { new: true } )

        res.json({
            msg: 'Client created',
            updatedUser,
            client
        });
    } catch (error) {       
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }

}


export const getClient = async(req: Request, res: Response) => {

    const { userId } = req.params

    if( !userId ) return res.status(400).json({
        msg: 'User id is required'
    });

    const user = await User.findById(userId).populate('clients').select('clients')

    if( !user ) return res.status(400).json({
        msg: 'User not found'
    });
    
    const clients = user.toObject();
        clients.clients = clients.clients.map( client => {
        const { __v, _id, ...clientData } = client;
        return { ...clientData, cid: _id }  ;
    });

    res.json({
        clients
    })

}
