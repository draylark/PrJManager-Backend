import { Request, Response } from 'express';
import Like from '../models/likeSchema';
import Comment from '../models/commentSchema';



export const getLikes = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    try {
        const likes = await Like.find({ commentId, isLike: true });
        res.json({
            likes: likes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const newLike = async (req: Request, res: Response) => {
    const { uid, isLike } = req.body;
    const { commentId } = req.params;

    
    try {
        if (typeof isLike !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value' });
        }

        const updateOperation = { $inc: { likes: 1 } } 
        const comment = await Comment.findByIdAndUpdate(commentId, updateOperation, { new: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const existingLike = await Like.findOne({ commentId, uid });

        if( existingLike ) {

            const updateLikeOperation = { $set: { isLike } };
            const likeUpdated = await Like.findOneAndUpdate({ commentId, uid }, updateLikeOperation, { new: true });

            return res.json({
                savedLike: likeUpdated,
                comment
            });

        } else {

            const like = new Like({ commentId, uid, isLike });
            const savedLike = await like.save();

            res.json({
                savedLike,
                comment      
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const updateLike = async (req: Request, res: Response) => {
    const { uid, isLike } = req.body;
    const { commentId } = req.params;

    try {       
        const commentUpdateOperation = { $inc: { likes: -1 } };
        const comment = await Comment.findByIdAndUpdate(commentId, commentUpdateOperation, { new: true });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const likeUpdateOperation = { $set: { isLike } };
        const likeUpdated = await Like.findOneAndUpdate({ commentId, uid }, likeUpdateOperation, { new: true });

        if (!likeUpdated) {
            return res.status(404).json({ message: 'Like not found' });
        }

        res.json({
            likeUpdated,
            comment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}