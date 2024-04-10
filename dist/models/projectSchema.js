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
const ProjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['In Progress', 'Completed', 'On Hold', 'Cancelled'],
        default: 'In Progress'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    tags: [String],
    collaborators: {
        type: Number,
        default: 0
    },
    layers: {
        type: Number,
        default: 0
    },
    repositories: {
        type: Number,
        default: 0
    },
    commits: {
        type: Number,
        default: 0
    },
    completedTasks: {
        type: Number,
        default: 0
    },
    tasks: {
        type: Number,
        default: 0
    },
    advancedSettings: {},
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });
ProjectSchema.methods.toJSON = function () {
    const _a = this.toObject(), { __v, password, _id } = _a, project = __rest(_a, ["__v", "password", "_id"]);
    project.pid = _id;
    return project;
};
const Project = (0, mongoose_1.model)('Project', ProjectSchema);
exports.default = Project;
//# sourceMappingURL=projectSchema.js.map