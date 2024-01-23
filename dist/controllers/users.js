"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsers = exports.putUsers = exports.getUsersById = exports.getUsers = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 5, from = 0 } = req.query;
    const [total, users] = yield Promise.all([
        userSchema_1.default.countDocuments({ state: true }),
        userSchema_1.default.find({ state: true })
            .skip(from)
            .limit(limit)
    ]);
    res.json({
        msg: 'get API - c',
        total,
        users
    });
});
exports.getUsers = getUsers;
const getUsersById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield userSchema_1.default.findOne({ _id: id, state: true });
        if (!user)
            return res.status(400).json({
                msg: 'User not found'
            });
        res.json({
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error'
        });
    }
});
exports.getUsersById = getUsersById;
const putUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const _a = req.body, { _id, password, google } = _a, resto = __rest(_a, ["_id", "password", "google"]);
    try {
        if (password) {
            const salt = bcryptjs_1.default.genSaltSync(10);
            resto.password = bcryptjs_1.default.hashSync(password, salt);
        }
        const user = yield userSchema_1.default.findByIdAndUpdate(id, resto);
        res.json({
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error',
            error
        });
    }
});
exports.putUsers = putUsers;
const deleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { authenticatedUser } = req;
    const user = yield userSchema_1.default.findByIdAndUpdate(id, { state: false });
    return res.json({
        user,
        authenticatedUser
    });
});
exports.deleteUsers = deleteUsers;
//# sourceMappingURL=users.js.map