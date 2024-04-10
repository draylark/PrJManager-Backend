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
exports.deleteNoti = exports.putNoti = exports.getNotisbyUserId = exports.postNoti = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const postNoti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, by, to } = req.body;
    const noti = new notisSchema_1.default({ title, description, by, to });
    yield noti.save();
    res.json({
        noti,
        msg: 'Noti created'
    });
});
exports.postNoti = postNoti;
const getNotisbyUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.id;
    try {
        const notis = yield notisSchema_1.default.find({ recipient: userid, status: true });
        return res.json({
            notis
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(400).json({
            msg: 'Internal Server Error'
        });
    }
});
exports.getNotisbyUserId = getNotisbyUserId;
const putNoti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { _id } = _a, rest = __rest(_a, ["_id"]);
        const noti = yield notisSchema_1.default.findByIdAndUpdate(req.params.id, rest);
        res.json({
            msg: 'Proyect Updated',
            noti
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.putNoti = putNoti;
const deleteNoti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.id;
        console.log(projectId);
        const noti = yield notisSchema_1.default.findById(projectId);
        if (!noti)
            return res.status(400).json({
                msg: 'The project dont exist'
            });
        // Verificar si el usuario autenticado es el creador del proyecto
        if (noti.owner.toString() !== req.uid) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const projectDeleted = yield projectSchema_1.default.findByIdAndDelete(projectId);
        res.json({
            projectDeleted
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.deleteNoti = deleteNoti;
//# sourceMappingURL=notis.js.map