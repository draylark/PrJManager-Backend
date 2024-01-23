import { Request, Response } from 'express';
import Like from '../models/likeSchema';


export const likes = async (req: Request, res: Response) => {
    const { commentId, uid, type } = req.body;

    // Validación de los datos de entrada...

    try {
        const existingLike = await Like.findOne({ commentId, uid });

        if (existingLike) {
            if (type !== null) {
                existingLike.type = type;
                await existingLike.save();
                res.status(200).json({ message: 'Like/Dislike actualizado', like: existingLike });
            } else {
                await existingLike.deleteOne();
                res.status(200).json({ message: 'Like/Dislike eliminado' });
            }
        } else {
            const newLike = new Like({ commentId, uid, type });
            await newLike.save();
            res.status(201).json({ message: 'Like/Dislike creado', like: newLike });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};