
import { Request, Response } from 'express';
import Comment from '../models/commentSchema';

// Define the Comment schema
interface CommentRequest extends Request {
    body: Comment;
}

// CRUD operations for comments

// Create a new comment
export const createComment = async (req: CommentRequest, res: Response) => {
    try {
        const newComment = new Comment(req.body);
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCommentOrReply = async (req, res) => {
    const { project, content, uid, parentCommentId } = req.body;

    try {
      const newComment = new Comment({
        project,
        content,
        createdBy: uid,
        comment: parentCommentId || null // Si es una respuesta, `parentCommentId` será el ID del comentario al que responde; de lo contrario, es null
      });
  
      await newComment.save();
      res.status(200).json({ message: 'Comment added successfully', newComment });
    } catch (error) {
      res.status(500).send('Server error');
    }
  };

// Get all comments
export const getAllComments = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    try {
        const comments = await Comment.find({ project: projectId });
        res.json({
            comments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCommentss = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 0; // Página por defecto es 0
    const limit = parseInt(req.query.limit as string) || 15; // Límite por defecto es 10

    try {
        const totalComments = await Comment.countDocuments({ project: projectId});
        const comments = await Comment.find({ project: projectId})
                                      .skip(page * limit)
                                      .limit(limit);

        res.json({
            total: totalComments,
            page,
            pages: Math.ceil(totalComments / limit),
            comments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommentReplies = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const replies = await Comment.find({ comment: commentId })
            .skip(skip)
            .limit(limit);

        const totalReplies = await Comment.countDocuments({ comment: commentId });

        res.json({
            totalReplies,
            page,
            totalPages: Math.ceil(totalReplies / limit),
            replies
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
export const updateComment = async (req: CommentRequest, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.text = req.body.text;
        const updatedComment = await comment.save();
        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a comment by ID
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        await comment.remove();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
