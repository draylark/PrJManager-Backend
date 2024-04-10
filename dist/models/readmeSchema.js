"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Definir el esquema del commit del repositorio
const ReadmeSchema = new mongoose_1.Schema({
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, { timestamps: true });
const Readme = (0, mongoose_1.model)('Readme', ReadmeSchema);
exports.default = Readme;
//# sourceMappingURL=readmeSchema.js.map