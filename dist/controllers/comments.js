"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeComment = exports.deleteComment = exports.updateComment = exports.getCommentById = exports.getCommentReplies = exports.createCommentOrReply = exports.getAllComments = void 0;
const commentSchema_1 = __importDefault(require("../models/commentSchema"));
// CRUD operations for comments
const getAllComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 0; // Página por defecto es 0
    const limit = parseInt(req.query.limit) || 15; // Límite por defecto es 10
    console.log('page', page);
    try {
        const totalComments = yield commentSchema_1.default.countDocuments({ project: projectId, commentParent: null, state: true });
        const comments = yield commentSchema_1.default.find({ project: projectId, commentParent: null, state: true })
            .skip(page * limit)
            .limit(limit);
        res.json({
            total_comments: totalComments,
            current_page: page + 1,
            total_pages: Math.ceil(totalComments / limit),
            comments
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllComments = getAllComments;
const createCommentOrReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project, content, uid, answering_to, photoUrl } = req.body;
    try {
        const comment = yield commentSchema_1.default.findById(answering_to);
        if (answering_to && comment) {
            const newComment = new commentSchema_1.default({
                project,
                content,
                createdBy: uid,
                photoUrl: photoUrl || null,
                commentParent: comment.commentParent ? comment.commentParent : answering_to,
                answering_to: !comment.commentParent ? null : answering_to
            });
            const commentId = comment.commentParent ? comment.commentParent : answering_to;
            yield newComment.save();
            const parentComment = yield commentSchema_1.default.findByIdAndUpdate(commentId, { $inc: { replies: 1 } }, { new: true });
            const newTotalPages = Math.ceil(parentComment.replies / 5);
            yield commentSchema_1.default.findByIdAndUpdate(commentId, { $set: { total_pages: newTotalPages } }, { new: true });
            return res.status(200).json({ message: 'Reply added successfully', newComment, parentComment });
        }
        const newComment = new commentSchema_1.default({
            project,
            content,
            createdBy: uid,
            commentParent: null,
            photoUrl: photoUrl || null
        });
        yield newComment.save();
        res.status(200).json({ message: 'Comment added successfully', newComment });
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});
exports.createCommentOrReply = createCommentOrReply;
const getCommentReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    try {
        const totalReplies = yield commentSchema_1.default.countDocuments({ commentParent: commentId, state: true });
        const replies = yield commentSchema_1.default.find({ commentParent: commentId, state: true })
            .skip(page * limit)
            .limit(limit);
        res.json({
            totalReplies,
            current_page: page + 1,
            total_pages: Math.ceil(totalReplies / limit),
            replies: replies || null
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCommentReplies = getCommentReplies;
// Get a single comment by ID
const getCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield commentSchema_1.default.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(comment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCommentById = getCommentById;
// Update a comment by ID
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield commentSchema_1.default.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.text = req.body.text;
        const updatedComment = yield comment.save();
        res.json(updatedComment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateComment = updateComment;
// Delete a comment by ID
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield commentSchema_1.default.findByIdAndUpdate(req.params.id, { state: false }, { new: true });
        comment === null || comment === void 0 ? void 0 : comment.save();
        res.json({
            message: 'Comment deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteComment = deleteComment;
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, uid, type } = req.body;
    try {
        const comment = yield commentSchema_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.likes.length > 0 && type === 'like'
            ? comment.likes = comment.likes + 1
            : comment.likes = comment.likes - 1;
        yield comment.save();
        res.status(200).json(comment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.likeComment = likeComment;
//# sourceMappingURL=comments.js.map