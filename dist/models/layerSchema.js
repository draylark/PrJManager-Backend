"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LayerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'internal'],
        required: true
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project'
    },
    repositories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Repo'
        }],
    collaborators: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            accessLevel: {
                type: Number,
                required: true
            }
        }],
    gitlabId: {
        type: Number,
        required: true
    }
});
exports.default = (0, mongoose_1.model)('Layer', LayerSchema);
//# sourceMappingURL=layerSchema.js.map