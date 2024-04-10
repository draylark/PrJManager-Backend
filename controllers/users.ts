import { Response, Request } from 'express'
import User from '../models/userSchema';
import bcryptjs from 'bcryptjs'


export const findUsers = async (req: Request, res: Response) => {
    const search = req.query.search;

    

    try {
        let queryConditions = [{ username: { $regex: search, $options: 'i' } }];

        // Intentar agregar la condición de búsqueda por ID si 'search' es un ID válido
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            queryConditions.push({ _id: search });
        }

        const users = await User.find({ $or: queryConditions });

        // Asumiendo que quieres enviar los usuarios encontrados como respuesta
        res.json({
            users
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al buscar usuarios'
        });
    }
}




export const getUsers = async (req: Request, res: Response) => {
    const { limit = 4, from = 0 } = req.query;
    const { IDS } = req.body; // Asume que 'IDS' es un arreglo de IDs de usuario
  
    try {
      const users = await User.find({ 
        '_id': { $in: IDS }, // Usa $in para seleccionar usuarios con IDs en el arreglo 'IDS'
        'state': true // Asumiendo que quieres seguir filtrando por el estado si es necesario
      })
      .skip(Number(from)) // Asegúrate de convertir 'from' y 'limit' a números
      .limit(Number(limit))
      .select('photoUrl _id username'); // Solo incluye 'photoUrl', '_id', y 'username'
  
      // Como el total específico de usuarios devueltos ya está definido por la longitud de 'users', no es necesario contarlos por separado
      const total = users.length;
  
      res.json({
        msg: 'get API - controller modified',
        total,
        users
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Error al obtener los usuarios'
      });
    }
  };



export const getUsersById = async( req: Request, res: Response ) => {

    const { id } = req.params


    try {

        const user = await User.findOne( { _id: id} )

        if(!user) return res.status(400).json({
            msg: 'User not found'
        })

        res.json({
            user
        })

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error1'
        })
    }


}; 



export const putUsers = async( req: Request, res: Response ) => {

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
            msg: 'Internal server Error2',
            error
        })
    }


}; 



export const deleteUsers = async( req: Request, res: Response ) => {

    const { id } = req.params
    const { authenticatedUser } = req
    const user = await User.findByIdAndUpdate( id, { state: false } );

    return res.json({
        user,
        authenticatedUser
    });

}; 


