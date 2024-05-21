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
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        require: [true, 'Name is required']
    },
    email: {
        type: String,
        require: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        require: [true, 'Password is required']
    },
    photoUrl: {
        type: String,
        default: null
    },
    google: {
        type: Boolean,
        default: false
    },
    website: {
        type: String,
        default: null
    },
    github: {
        type: String,
        default: null
    },
    twitter: {
        type: String,
        default: null
    },
    linkedin: {
        type: String,
        default: null
    },
    projects: {
        type: Number,
        default: 0
    },
    topProjects: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Project',
        default: []
    },
    state: {
        type: Boolean,
        default: true
    },
    personalAccessToken: {
        type: String,
        default: null
    }
});
UserSchema.methods.toJSON = function () {
    const _a = this.toObject(), { __v, password, _id } = _a, user = __rest(_a, ["__v", "password", "_id"]);
    user.uid = _id;
    return user;
};
exports.default = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=userSchema.js.map