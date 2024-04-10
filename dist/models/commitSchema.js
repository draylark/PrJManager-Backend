"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Definir el esquema del commit del repositorio
const CommitSchema = new mongoose_1.Schema({
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    layer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Layer',
        required: true
    },
    repository: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Repo',
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    author: {
        uid: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        photoUrl: {
            type: String,
            default: null
        }
    },
    message: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    uuid: {
        type: String,
        required: true
    }
}, { timestamps: true });
const Commit = (0, mongoose_1.model)('Commit', CommitSchema);
exports.default = Commit;
//# sourceMappingURL=commitSchema.js.map