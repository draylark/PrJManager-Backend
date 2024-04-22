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
        enum: ['open', 'internal', 'restricted'],
        required: true
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project'
    },
    repositories: {
        type: Number,
        default: 0
    },
    gitlabId: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});
const Layer = (0, mongoose_1.model)('Layer', LayerSchema);
exports.default = Layer;
//# sourceMappingURL=layerSchema.js.map