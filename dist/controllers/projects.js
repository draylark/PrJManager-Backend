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
exports.getProjectById = exports.calculateProjectProgress = exports.deleteProject = exports.putProject = exports.getProject = exports.postProject = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const postProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { name } = _a, rest = __rest(_a, ["name"]);
    if (!name || !rest.description || !rest.endDate)
        return res.status(400).json({
            msg: 'Faltan campos por llenar'
        });
    const project = yield projectSchema_1.default.find({ name });
    if (project.length > 0)
        return res.status(400).json({
            msg: 'This project\'s name already exist, choose another one'
        });
    try {
        const project = new projectSchema_1.default(Object.assign({ name }, rest));
        yield project.save();
        const updatedUser = yield userSchema_1.default.findByIdAndUpdate(req.uid, { $push: { createdProjects: project._id } }, { new: true });
        const projectRepoDir = path_1.default.join(__dirname, '..', '..', 'repos', `${project._id}`);
        if (!fs_1.default.existsSync(projectRepoDir)) {
            fs_1.default.mkdirSync(projectRepoDir);
        }
        res.json({
            project,
            updatedUser,
            msg: 'Proyect created'
        });
    }
    catch (error) {
        console.log(rest);
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.postProject = postProject;
const getProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId)
        return res.status(400).json({
            msg: 'User id is required'
        });
    const projects = yield projectSchema_1.default.find({ owner: userId });
    res.json({
        projects
    });
});
exports.getProject = getProject;
const getProjectById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    console.log(projectId);
    try {
        if (!projectId)
            return res.status(400).json({
                msg: 'Project id is required'
            });
        const project = yield projectSchema_1.default.findById(projectId);
        return res.json({
            project
        });
    }
    catch (error) {
        return res.json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.getProjectById = getProjectById;
const putProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    console.log(req.body);
    if (!projectId)
        return res.status(400).json({
            msg: 'Project id is required'
        });
    try {
        const project = yield projectSchema_1.default.findByIdAndUpdate(projectId, req.body, { new: true });
        res.status(200).json({
            project
        });
    }
    catch (error) {
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.putProject = putProject;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.id;
        console.log(projectId);
        const project = yield projectSchema_1.default.findById(projectId);
        if (!project)
            return res.status(400).json({
                msg: 'The project dont exist'
            });
        // Verificar si el usuario autenticado es el creador del proyecto
        if (project.owner.toString() !== req.uid) {
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
exports.deleteProject = deleteProject;
const calculateProjectProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    console.log(projectId);
    try {
        if (!projectId)
            return res.status(400).json({
                msg: 'Project id is required'
            });
        const tasks = yield taskSchema_1.default.find({ projectId });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        res.json({
            progress
        });
    }
    catch (error) {
        console.error('Error calculating project progress:', error);
        res.status(500).json({ error: 'Hubo un error al calcular el progreso del proyecto' });
    }
});
exports.calculateProjectProgress = calculateProjectProgress;
//# sourceMappingURL=projects.js.map