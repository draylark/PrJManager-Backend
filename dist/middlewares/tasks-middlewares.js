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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectTasksBaseOnAccess = exports.getProjectTasksBaseOnAccessForHeatMap = exports.validateUserAccessForTaskData = void 0;
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const validateUserAccessForTaskData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const uid = req.query.uid;
    try {
        const collaboratorOn = yield collaboratorSchema_1.default.find({
            uid,
            projectID,
            state: true,
            $or: [
                { 'layer._id': { $exists: true } },
                { 'repository._id': { $exists: true } }
            ]
        })
            .populate('layer._id')
            .populate('repository._id');
        if (!collaboratorOn) {
            req.type = 'guest';
            return next();
        }
        req.collaboratorOn = collaboratorOn;
        req.type = 'collaborator';
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.validateUserAccessForTaskData = validateUserAccessForTaskData;
const getProjectTasksBaseOnAccessForHeatMap = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const uid = req.query.uid;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    const { levels, owner, type } = req;
    if (owner && owner === true) {
        return next();
    }
    console.log('Tipo', type);
    let matchCondition = { project: projectID, status: 'completed' };
    if (year) {
        matchCondition = Object.assign(Object.assign({}, matchCondition), { updatedAt: {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            } });
    }
    try {
        if (type === 'collaborator') {
            const tasks = yield taskSchema_1.default.find(matchCondition)
                // .populate('layer_related_id repository_related_id')
                .lean();
            const filteredTasksBaseOnAccess = (yield Promise.all(tasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer_related_id, repository_related_id } = task;
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'layer._id': layer_related_id });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'repository._id': repository_related_id });
                if (cLayer && cRepo) {
                    // Si 'task' es un documento Mongoose, asegúrate de convertirlo a un objeto plano con .toObject()
                    const taskWithIdsOnly = Object.assign(Object.assign({}, task.toObject ? task.toObject() : task), { layer_related_id,
                        repository_related_id });
                    return taskWithIdsOnly;
                }
                // No es necesario retornar nada aquí, lo cual resultará en 'undefined'
            })))).filter(task => task !== undefined); //
            console.log('Tareas filtradas en base a el acceso exclusivo', filteredTasksBaseOnAccess);
            req.tasks = filteredTasksBaseOnAccess;
            next();
        }
        else {
            const tasks = yield taskSchema_1.default.find(matchCondition)
                .populate('layer_related_id repository_related_id')
                .lean();
            const filteredTasksBaseOnLevel = tasks.reduce((acc, task) => {
                const { layer_related_id, repository_related_id } = task;
                if (layer_related_id && repository_related_id && levels.includes(layer_related_id.visibility) && levels.includes(repository_related_id.visibility)) {
                    const taskWithIdsOnly = Object.assign(Object.assign({}, task), { layer_related_id: layer_related_id._id, repository_related_id: repository_related_id._id });
                    acc.push(taskWithIdsOnly);
                }
                ;
                return acc;
            }, []);
            console.log('Tareas filtradas en base a el acceso por nivel', filteredTasksBaseOnLevel);
            req.tasks = filteredTasksBaseOnLevel;
            next();
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.getProjectTasksBaseOnAccessForHeatMap = getProjectTasksBaseOnAccessForHeatMap;
const getProjectTasksBaseOnAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { levels, owner } = req;
    if (owner && owner === true) {
        return next();
    }
    try {
        const tasks = yield taskSchema_1.default.find({ project: projectID, status: { $in: ['completed', 'approval'] } })
            .populate('layer_related_id repository_related_id')
            .lean();
        const filteredTasksBaseOnLevel = tasks.reduce((acc, task) => {
            const { layer_related_id, repository_related_id } = task;
            if (layer_related_id && repository_related_id && levels.includes(layer_related_id.visibility) && levels.includes(repository_related_id.visibility)) {
                const taskWithIdsOnly = Object.assign(Object.assign({}, task), { layer_related_id: layer_related_id._id, repository_related_id: repository_related_id._id });
                acc.push(taskWithIdsOnly);
            }
            ;
            return acc;
        }, []);
        const completedTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'completed');
        const approvalTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'approval');
        req.completedTasks = completedTasks;
        req.approvalTasks = approvalTasks;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.getProjectTasksBaseOnAccess = getProjectTasksBaseOnAccess;
//# sourceMappingURL=tasks-middlewares.js.map