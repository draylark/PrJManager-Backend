"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const repoSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    gitlabId: {
        type: Number,
        required: true,
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    layer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Layer',
        required: true,
    },
    visibility: {
        type: String,
        required: true,
        enum: ['public', 'internal', 'private'],
    },
    webUrl: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    collaborators: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            accessLevel: {
                type: String,
                enum: ['Editor', 'Reader', 'Admin', 'owner'],
                required: true,
            },
        },
    ],
    branches: [
        {
            name: {
                type: String,
                required: true,
            },
            lastCommit: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Commit',
            },
        },
    ],
    commits: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Commit',
        },
    ],
    gitUrl: {
        type: String,
        required: true,
    }
}, { timestamps: true });
const Repo = (0, mongoose_1.model)('Repo', repoSchema);
exports.default = Repo;
//# sourceMappingURL=repoSchema.js.map