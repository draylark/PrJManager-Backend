"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const followerSchema = new mongoose_1.Schema({
    uid: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    mutualFollow: {
        type: Boolean,
        default: false
    },
    followedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
const Follower = (0, mongoose_1.model)('Follower', followerSchema);
exports.default = Follower;
//# sourceMappingURL=followerSchema.js.map