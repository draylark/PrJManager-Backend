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
    status: {
        type: String,
        enum: [],
        default: 'In Progress'
    },
    members: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    layers: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Group'
        }],
    repos: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Repo'
        }],
    tasks: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Task'
        }],
    progress: [{
            timestamp: {
                type: Date,
                default: Date.now
            },
            tasksCompleted: {
                type: Number,
                default: 0
            }
        }],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    tags: [String],
    changeLogs: [{
            message: String,
            date: {
                type: Date,
                default: Date.now
            }
        }],
    attachments: [String],
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment'
        }],
    clients: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Client'
        }]
});
ProjectSchema.methods.toJSON = function () {
    const _a = this.toObject(), { __v, password, _id } = _a, project = __rest(_a, ["__v", "password", "_id"]);
    project.pid = _id;
    return project;
};
exports.default = (0, mongoose_1.model)('Project', ProjectSchema);
//# sourceMappingURL=projectSchema.js.map