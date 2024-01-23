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
exports.getTasksByProject = exports.deleteTask = exports.putTask = exports.getTask = exports.postTask = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const postTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, projectId, createdBy, parentId, dueDate, endDate } = req.body;
    const project = yield projectSchema_1.default.findById(projectId);
    if (!project)
        return res.status(400).json({
            msg: 'This project doesnt exist or is it no longer active'
        });
    if (!name || !description || !projectId || !createdBy)
        return res.status(400).json({
            msg: 'Faltan campos por llenar'
        });
    try {
        // console.log(req.body)
        const thereIsParentId = parentId.length > 1 ? parentId : null;
        const task = new taskSchema_1.default({ name, description, projectId, createdBy, parentId: thereIsParentId, dueDate, endDate });
        yield task.save();
        const updatedProject = yield projectSchema_1.default.findByIdAndUpdate(projectId, { $push: { tasks: task._id } }, { new: true });
        return res.json({
            task,
            updatedProject,
            msg: 'Task created'
        });
    }
    catch (error) {
        console.log(req.body);
        return res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.postTask = postTask;
const getTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tasks = yield taskSchema_1.default.find({ createdBy: id }).sort({ createdAt: -1 });
    res.json({
        tasks
    });
});
exports.getTask = getTask;
const putTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { _id } = _a, rest = __rest(_a, ["_id"]);
        const task = yield taskSchema_1.default.findByIdAndUpdate(req.params.id, rest);
        res.json({
            msg: 'Proyect Updated',
            task
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
exports.putTask = putTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.id;
        console.log(projectId);
        const task = yield projectSchema_1.default.findById(projectId);
        if (!task)
            return res.status(400).json({
                msg: 'The project dont exist'
            });
        // Verificar si el usuario autenticado es el creador del proyecto
        if (task.createdBy.toString() !== req.uid) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const projectDeleted = yield projectSchema_1.default.findByIdAndDelete(projectId);
        res.json({
            projectDeleted
        });
    }
    catch (error) {
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.deleteTask = deleteTask;
const completeTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = req.body, { _id } = _b, rest = __rest(_b, ["_id"]);
        const task = yield projectSchema_1.default.findByIdAndUpdate(req.params.id, rest);
        res.json({
            msg: 'Proyect Updated',
            task
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
const getTasksByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const tasks = yield taskSchema_1.default.find({ projectId });
    res.json({
        tasks
    });
});
exports.getTasksByProject = getTasksByProject;
//# sourceMappingURL=tasks.js.map