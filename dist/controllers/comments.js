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
exports.deleteComment = exports.updateComment = exports.getCommentById = exports.getCommentReplies = exports.getAllCommentss = exports.getAllComments = exports.createCommentOrReply = exports.createComment = void 0;
const commentSchema_1 = __importDefault(require("../models/commentSchema"));
// CRUD operations for comments
// Create a new comment
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newComment = new commentSchema_1.default(req.body);
        const savedComment = yield newComment.save();
        res.status(201).json(savedComment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createComment = createComment;
const createCommentOrReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project, content, uid, parentCommentId } = req.body;
    try {
        const newComment = new commentSchema_1.default({
            project,
            content,
            createdBy: uid,
            comment: parentCommentId || null // Si es una respuesta, `parentCommentId` será el ID del comentario al que responde; de lo contrario, es null
        });
        yield newComment.save();
        res.status(200).json({ message: 'Comment added successfully', newComment });
    }
    catch (error) {
        res.status(500).send('Server error');
    }
});
exports.createCommentOrReply = createCommentOrReply;
// Get all comments
const getAllComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const comments = yield commentSchema_1.default.find({ project: projectId });
        res.json({
            comments
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllComments = getAllComments;
const getAllCommentss = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 0; // Página por defecto es 0
    const limit = parseInt(req.query.limit) || 15; // Límite por defecto es 10
    try {
        const totalComments = yield commentSchema_1.default.countDocuments({ project: projectId });
        const comments = yield commentSchema_1.default.find({ project: projectId })
            .skip(page * limit)
            .limit(limit);
        res.json({
            total: totalComments,
            page,
            pages: Math.ceil(totalComments / limit),
            comments
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllCommentss = getAllCommentss;
const getCommentReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const replies = yield commentSchema_1.default.find({ comment: commentId })
            .skip(skip)
            .limit(limit);
        const totalReplies = yield commentSchema_1.default.countDocuments({ comment: commentId });
        res.json({
            totalReplies,
            page,
            totalPages: Math.ceil(totalReplies / limit),
            replies
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
        const comment = yield commentSchema_1.default.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        yield comment.remove();
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteComment = deleteComment;
//# sourceMappingURL=comments.js.map