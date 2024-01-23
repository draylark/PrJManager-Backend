import { Request, Response } from 'express';
import User from '../models/userSchema';


export const searcher = async(req: Request, res: Response) => {

    const { type } = req.params
    const { searchTerm } = req.body
    const { limit = 5, from = 0 } = req.query

    if (!searchTerm.trim()) {
        return res.status(400).json({ msg: 'Search term is empty' });
    }

    if( type ){

        try {
            switch (type) {
                case 'users':
                    const users = await User.find({ username: { $regex: searchTerm, $options: 'i' } })
                                            .skip(from)
                                            .limit(limit);
                                                         
                    if (users.length === 0) {
                        return res.status(404).json({ msg: 'No users found' });
                    }

                    return res.json({ users });
        
                default:
                    return res.status(400).json({ msg: 'Bad request' });
            }

        } catch (error) {
            // Manejar errores, por ejemplo, errores de la base de datos
            return res.status(500).json({ msg: 'Server error', error: error.message });
        }
    } 

    const users = await User.find({ username: { $regex: searchTerm, $options: 'i' } })
                            .skip(from)
                            .limit(limit);
                 
    if (users.length === 0) {
        return res.status(404).json({ msg: 'No users found' });
    }

    return res.json({ users });

}