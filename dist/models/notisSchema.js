"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotisSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['task-assignation', 'friend-request', 'project-invitation', 'new-repo', 'new-layer', 'new-commit'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        name: {
            type: String,
            required: true
        },
        ID: {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true
        },
        photoUrl: {
            type: String,
            default: null
        }
    },
    additionalData: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});
const Noti = (0, mongoose_1.model)('Notis', NotisSchema);
exports.default = Noti;
//# sourceMappingURL=notisSchema.js.map