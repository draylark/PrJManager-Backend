"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NoteSchema = new mongoose_1.Schema({
    uid: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    text: {
        type: String,
        default: null,
        maxlength: 500 // Por ejemplo, un máximo de 500 caracteres
    },
}, { timestamps: true });
const Note = (0, mongoose_1.model)('Note', NoteSchema);
exports.default = Note;
//# sourceMappingURL=noteSchema.js.map