"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
    uid: {
        type: String,
        required: true
    },
    prjConsoleUID: {
        type: String,
        required: true,
    },
    extensionUID: {
        type: String,
        required: true
    },
    operativeSystem: {
        type: String,
        default: 'Unknown'
    },
    device: {
        type: String,
        default: 'Unknown'
    }
}, { timestamps: true });
const Session = (0, mongoose_1.model)('Session', sessionSchema);
exports.default = Session;
//# sourceMappingURL=sessionSchema.js.map