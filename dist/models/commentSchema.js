"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true
    },
    project: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    commentParent: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null // Esto indica que puede ser un comentario principal o una respuesta
    },
    answering_to: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: {
        type: Number,
        default: 0
    },
    replies: {
        type: Number,
        default: 0
    },
    total_pages: {
        type: Number,
        default: 0
    },
    state: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
// Crear y exportar el modelo de comentarios
exports.default = mongoose_1.default.model('Comment', commentSchema);
//# sourceMappingURL=commentSchema.js.map