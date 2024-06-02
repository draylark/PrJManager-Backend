"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const friendshipSchema = new mongoose_1.Schema({
    ids: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'User',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
const Friendship = (0, mongoose_1.model)('Friendship', friendshipSchema);
exports.default = Friendship;
//# sourceMappingURL=friendshipSchema.js.map