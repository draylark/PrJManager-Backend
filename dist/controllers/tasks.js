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
exports.getTasksByProject = exports.getProyectTasksDataForHeatMap = exports.getTasksByRepo = exports.completeTask = exports.deleteTask = exports.putTask = exports.getTask = exports.createNewTask = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const createNewTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = new taskSchema_1.default(req.body);
        yield task.save();
        return res.json({
            task,
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
exports.createNewTask = createNewTask;
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
exports.completeTask = completeTask;
const getTasksByRepo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const tasks = yield taskSchema_1.default.find({ repository_related_id: repoID });
    // console.log(tasks)
    // console.log(repoID)
    res.json({
        tasks
    });
});
exports.getTasksByRepo = getTasksByRepo;
const getProyectTasksDataForHeatMap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { owner, tasks } = req;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    try {
        if (owner && owner === true) {
            let matchCondition = { project: projectID, status: 'completed' };
            if (year) {
                matchCondition = Object.assign(Object.assign({}, matchCondition), { updatedAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    } });
            }
            const tasks = yield taskSchema_1.default.find(matchCondition)
                .select('-hash')
                .sort({ createdAt: -1 });
            return res.json({
                tasks
            });
        }
        else {
            return res.json({
                tasks
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getProyectTasksDataForHeatMap = getProyectTasksDataForHeatMap;
const getTasksByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    const { owner, completedTasks, approvalTasks } = req;
    try {
        if (owner && owner === true) {
            console.log('Entrando al owner');
            let matchCondition1 = { project: projectID, status: { $in: ['completed', 'approval'] } };
            if (year) {
                matchCondition1 = Object.assign(Object.assign({}, matchCondition1), { updatedAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    } });
            }
            const tasks = yield taskSchema_1.default.find(matchCondition1)
                .sort({ createdAt: -1 });
            const completedTasks = tasks.filter(task => task.status === 'completed');
            const approvalTasks = tasks.filter(task => task.status === 'approval');
            return res.json({
                completedTasks,
                approvalTasks
            });
        }
        else {
            console.log('Entrando al colaborador');
            return res.json({
                completedTasks,
                approvalTasks
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getTasksByProject = getTasksByProject;
//# sourceMappingURL=tasks.js.map