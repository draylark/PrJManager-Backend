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
exports.deleteProyect = exports.putProyect = exports.getProyect = exports.postProyect = void 0;
const proyectSchema_1 = __importDefault(require("../models/proyectSchema"));
const postProyect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, endDate } = req.body;
    if (!name || !description || !endDate)
        return res.status(400).json({
            msg: 'Faltan campos por llenar'
        });
    const proyect = new proyectSchema_1.default({ name, description, endDate, owner: req.uid });
    yield proyect.save();
    res.json({
        proyect,
        msg: 'Proyect created'
    });
});
exports.postProyect = postProyect;
const getProyect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 5, from = 0 } = req.query;
    const [total, proyects] = yield Promise.all([
        proyectSchema_1.default.countDocuments(),
        proyectSchema_1.default.find()
            .skip(from)
            .limit(limit)
    ]);
    res.json({
        total,
        proyects
    });
});
exports.getProyect = getProyect;
const putProyect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { _id } = _a, rest = __rest(_a, ["_id"]);
        const user = yield proyectSchema_1.default.findByIdAndUpdate(req.params.id, rest);
        res.json({
            msg: 'Proyect Updated',
            user
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
exports.putProyect = putProyect;
const deleteProyect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.id;
        console.log(projectId);
        const project = yield proyectSchema_1.default.findById(projectId);
        if (!project)
            return res.status(400).json({
                msg: 'The project dont exist'
            });
        // Verificar si el usuario autenticado es el creador del proyecto
        if (project.owner.toString() !== req.uid) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const projectDeleted = yield proyectSchema_1.default.findByIdAndDelete(projectId);
        res.json({
            projectDeleted
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.deleteProyect = deleteProyect;
//# sourceMappingURL=proyects.js.map