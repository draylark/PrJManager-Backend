"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const collaboratorSchema = new mongoose_1.Schema({
    project: {
        _id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Project',
        },
        accessLevel: {
            type: String,
            enum: ['contributor', 'coordinator', 'manager', 'administrator'],
        }
    },
    layer: {
        _id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Layer',
        },
        accessLevel: {
            type: String,
            enum: ['contributor', 'coordinator', 'manager', 'administrator'],
        }
    },
    repository: {
        _id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Repo',
        },
        accessLevel: {
            type: String,
            enum: ['reader', 'editor', 'manager', 'administrator'],
        }
    },
    projectID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    uid: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: null
    },
    photoUrl: {
        type: String,
        default: null
    },
    state: {
        type: Boolean,
        default: true
    },
});
const Collaborator = (0, mongoose_1.model)('Collaborator', collaboratorSchema);
exports.default = Collaborator;
//# sourceMappingURL=collaboratorSchema.js.map