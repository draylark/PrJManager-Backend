"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const friendSchema = new mongoose_1.Schema({
    friends_reference: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    friendship_status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    requester: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    state: {
        type: Boolean,
        default: false,
    }
});
const Friend = (0, mongoose_1.model)('Friend', friendSchema);
exports.default = Friend;
//# sourceMappingURL=friendSchema.js.map