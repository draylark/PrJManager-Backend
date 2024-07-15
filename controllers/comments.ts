
import { Request, Response } from 'express';
import Comment from '../models/commentSchema';
import path from 'path';

// Define the Comment schema
interface CommentRequest extends Request {
    body: Comment;
}

// CRUD operations for comments



export const getAllComments = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 0; // Página por defecto es 0
    const limit = parseInt(req.query.limit as string) || 15; // Límite por defecto es 10

    try {
        const totalComments = await Comment.countDocuments({ project: projectId, commentParent: null, state: true });
        const comments = await Comment.find({ project: projectId, commentParent: null, state: true})
                                      .skip( page * limit )
                                      .limit(limit)
                                      .populate({
                                        path: 'createdBy',
                                        select: 'username photoUrl'
                                      })

        res.json({
            total_comments: totalComments,
            current_page: page + 1,
            total_pages: Math.ceil(totalComments / limit),
            comments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const createCommentOrReply = async (req: Request, res: Response) => {
    const { project, content, uid, answering_to, photoUrl } = req.body;

    try {
        const comment = await Comment.findById(answering_to)

        if( answering_to && comment ){
            const newComment = new Comment({
                project,
                content,
                createdBy: uid,
                photoUrl: photoUrl || null,
                commentParent: comment.commentParent ? comment.commentParent : answering_to,
                answering_to: !comment.commentParent ? null : answering_to        
            });

            const commentId = comment.commentParent ? comment.commentParent : answering_to

            await newComment.save();
            const parentComment = await Comment.findByIdAndUpdate(commentId, { $inc: { replies: 1 } }, { new: true });
            if(parentComment){
                const newTotalPages = Math.ceil(parentComment.replies / 5);
                await Comment.findByIdAndUpdate(commentId, { $set: { total_pages: newTotalPages } }, { new: true })          
            }
            return res.status(200).json({ message: 'Reply added successfully', newComment, parentComment });
        }
 
      const newComment = new Comment({
        project,
        content,
        createdBy: uid,
        commentParent: null, // Si es una respuesta, `parentCommentId` será el ID del comentario al que responde; de lo contrario, es null
        photoUrl: photoUrl || null
      });

      await newComment.save();
      res.status(200).json({ message: 'Comment added successfully', newComment });

    } catch (error) {
        console.log(error)
      res.status(500).send('Server error');
    }
  };

export const getCommentReplies = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const queryPage  = req.query.page as string;
    const queryLimit = req.query.limit as string;
    const page = parseInt(queryPage) || 0;
    const limit = parseInt(queryLimit) || 5;

    try {

        const totalReplies = await Comment.countDocuments({ commentParent: commentId, state: true });
        const replies = await Comment.find({ commentParent: commentId, state: true})
                                    .skip( page * limit )
                                    .limit(limit)
                                    .populate({
                                        path: 'createdBy',
                                        select: 'username photoUrl'
                                    })
            
        res.json({
            totalReplies,
            current_page: page + 1,
            total_pages: Math.ceil(totalReplies / limit),
            replies: replies || null
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single comment by ID
export const getCommentById = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a comment by ID
export const updateComment = async (req: Request, res: Response) => {
    const { text } = req.body;
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.content = text;
        const updatedComment = await comment.save();
        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a comment by ID
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, { state: false }, { new: true });
         comment?.save()
        res.json({ 
            message: 'Comment deleted successfully'
         });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const likeComment = async (req: Request, res: Response) => {
    const { commentId, uid, type } = req.body;

    try {
      const comment = await Comment.findById(commentId)
     
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.likes > 0 && type === 'like'
        ? comment.likes = comment.likes + 1 
        : comment.likes = comment.likes - 1         

        await comment.save();
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}