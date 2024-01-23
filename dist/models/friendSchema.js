"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const friendSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});
const Friend = (0, mongoose_1.model)('Friend', friendSchema);
exports.default = Friend;
//# sourceMappingURL=friendSchema.js.map