"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Definir la interfaz para el documento de comentario
// interface IComment extends Document {
//     projectId: string;
//     content: string;
//     author: string;
//     createdAt: Date;
// }
// // Definir el esquema de comentarios
// const commentSchema = new Schema({
//     project: { type: Schema.Types.ObjectId, ref: 'Project' },
//     user: { type: Schema.Types.ObjectId, ref: 'User' },
//     text: String,
//     createdAt: { type: Date, default: Date.now }
//   });
const replySchema = new mongoose_1.default.Schema({
    content: String,
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const commentSchema = new mongoose_1.default.Schema({
    content: String,
    project: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null // Esto indica que puede ser un comentario principal o una respuesta
    },
    likes: Number
});
// Crear y exportar el modelo de comentarios
exports.default = mongoose_1.default.model('Comment', commentSchema);
//# sourceMappingURL=commentSchema.js.map