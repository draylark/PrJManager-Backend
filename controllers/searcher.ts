import { Request, Response } from 'express';
import User from '../models/userSchema';
import Project from '../models/projectSchema';


export const searcher = async(req: Request, res: Response) => {

    const { type } = req.params
    const { searchTerm } = req.body
    const { limit = 15, from = 0 } = req.query

    if (!searchTerm.trim()) {
        return res.status(400).json({ msg: 'Search term is empty' });
    }

    if( type ){

        try {
            switch (type) {
                case 'profiles':
                    const users = await User.find({ username: { $regex: searchTerm, $options: 'i' } })
                                            .skip(from)
                                            .limit(limit)
                                            .select('username _id photoUrl projects');
                                                        
                    return res.json({ results: users });

                case 'projects':
                    const projects = await Project.find({ name: { $regex: searchTerm, $options: 'i' }, visibility: 'public' })
                                            .skip(from)
                                            .limit(limit);                                                     

                    return res.json({ results: projects });
                    
        
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