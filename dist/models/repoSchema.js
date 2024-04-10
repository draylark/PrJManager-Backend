"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
    visibility: {
        type: String,
        required: true,
        enum: ['open', 'internal', 'restricted'],
    },
    gitUrl: {
        type: String,
        required: true,
    },
    webUrl: {
        type: String,
        required: true,
    },
    branches: [
        {
            name: { type: String, required: true, unique: true },
            default: { type: Boolean, required: true, },
        },
    ],
    defaultBranch: {
        type: String,
        required: true,
    },
    projectID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    layerID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Layer',
        required: true,
    },
    gitlabId: {
        type: Number,
        required: true,
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
repoSchema.methods.toJSON = function () {
    const _a = this.toObject(), { __v, webUrl, gitUrl, repoGitlabId } = _a, repo = __rest(_a, ["__v", "webUrl", "gitUrl", "repoGitlabId"]);
    return repo;
};
const Repo = (0, mongoose_1.model)('Repo', repoSchema);
exports.default = Repo;
//# sourceMappingURL=repoSchema.js.map