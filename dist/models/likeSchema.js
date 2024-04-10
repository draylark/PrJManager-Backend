"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const likeSchema = new mongoose_1.Schema({
    uid: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    isLike: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Like', likeSchema);
//# sourceMappingURL=likeSchema.js.map