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
exports.updateLike = exports.newLike = exports.getLikes = void 0;
const likeSchema_1 = __importDefault(require("../models/likeSchema"));
const commentSchema_1 = __importDefault(require("../models/commentSchema"));
const getLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, uid } = req.params;
    try {
        const like = yield likeSchema_1.default.findOne({ commentId, uid, isLike: true });
        res.json({
            like: like || null // Devuelve el like encontrado o null si no hay coincidencia
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getLikes = getLikes;
const newLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, isLike } = req.body;
    const { commentId } = req.params;
    try {
        if (typeof isLike !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value' });
        }
        const updateOperation = { $inc: { likes: 1 } };
        const comment = yield commentSchema_1.default.findByIdAndUpdate(commentId, updateOperation, { new: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const existingLike = yield likeSchema_1.default.findOne({ commentId, uid });
        if (existingLike) {
            const updateLikeOperation = { $set: { isLike } };
            const likeUpdated = yield likeSchema_1.default.findOneAndUpdate({ commentId, uid }, updateLikeOperation, { new: true });
            return res.json({
                likeUpdated,
                comment
            });
        }
        else {
            const like = new likeSchema_1.default({ commentId, uid, isLike });
            const savedLike = yield like.save();
            res.json({
                savedLike,
                comment
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.newLike = newLike;
const updateLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, isLike } = req.body;
    const { commentId } = req.params;
    try {
        const commentUpdateOperation = { $inc: { likes: -1 } };
        const comment = yield commentSchema_1.default.findByIdAndUpdate(commentId, commentUpdateOperation, { new: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const likeUpdateOperation = { $set: { isLike } };
        const likeUpdated = yield likeSchema_1.default.findOneAndUpdate({ commentId, uid }, likeUpdateOperation, { new: true });
        if (!likeUpdated) {
            return res.status(404).json({ message: 'Like not found' });
        }
        res.json({
            likeUpdated,
            comment
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateLike = updateLike;
//# sourceMappingURL=likes.js.map