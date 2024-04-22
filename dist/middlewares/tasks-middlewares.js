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
exports.validateCollaboratorAccess = exports.getProjectTasksBaseOnAccess = exports.getProjectTasksBaseOnAccessForHeatMap = exports.validateUserAccessForTaskData = void 0;
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const evalAccess = (cOnLayer, cOnRepo, lVisibility, RVisibility) => {
    if (cOnLayer && cOnRepo && cOnLayer.state && !cOnRepo.state && RVisibility === 'open') {
        return true;
    }
    if (cOnLayer && cOnRepo && !cOnLayer.state && lVisibility === 'open' && !cOnRepo.state && RVisibility === 'open') {
        return true;
    }
    return false;
};
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
                .populate('layer_related_id repository_related_id')
                .lean();
            const filteredTasksBaseOnAccess = (yield Promise.all(tasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer_related_id: { _id: taskId }, repository_related_id: { _id: repoId } } = task, rest = __rest(task, ["layer_related_id", "repository_related_id"]);
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'layer._id': taskId });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'repository._id': repoId });
                if (cLayer && cRepo) {
                    return Object.assign(Object.assign({}, rest), { layer_related_id: taskId, repository_related_id: repoId });
                    ;
                }
            })))).filter(task => task !== undefined);
            const uniqueTasksOnOpenParents = (yield Promise.all(tasks.filter(openTask => !filteredTasksBaseOnAccess.some(task => task._id.toString() === openTask._id.toString())).map((task) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer_related_id: { _id: taskId, visibility: layerVis }, repository_related_id: { _id: repoId, visibility: repoVis } } = task, rest = __rest(task, ["layer_related_id", "repository_related_id"]);
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'layer._id': taskId });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'repository._id': repoId });
                if (evalAccess(cLayer, cRepo, layerVis, repoVis)) {
                    return Object.assign(Object.assign({}, rest), { layer_related_id: taskId, repository_related_id: repoId });
                }
                ;
            })))).filter(task => task !== undefined);
            req.tasks = [...filteredTasksBaseOnAccess, ...uniqueTasksOnOpenParents];
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
    const { levels, owner, type } = req;
    const uid = req.query.uid;
    if (owner && owner === true) {
        return next();
    }
    try {
        if (type === 'collaborator') {
            const tasks = yield taskSchema_1.default.find({ project: projectID, status: { $in: ['completed', 'approval'] } })
                .populate('layer_related_id repository_related_id')
                .lean();
            // ! Tareas en el que el usuario tiene acceso como colaborador ( state : true )
            const filteredTasksBaseOnAccess = (yield Promise.all(tasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer_related_id: { _id: taskId }, repository_related_id: { _id: repoId } } = task, rest = __rest(task, ["layer_related_id", "repository_related_id"]);
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'layer._id': taskId });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'repository._id': repoId });
                if (cLayer && cRepo) {
                    return Object.assign(Object.assign({}, rest), { layer_related_id: taskId, repository_related_id: repoId });
                    ;
                }
            })))).filter(task => task !== undefined);
            // ! Tareas en el caso de que el usuario no tiene acceso como colaborador ( state: false ), pero los padres son abiertos
            const uniqueTasksOnOpenParents = (yield Promise.all(tasks.filter(openTask => !filteredTasksBaseOnAccess.some(task => task._id.toString() === openTask._id.toString())).map((task) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer_related_id: { _id: layerId, visibility: layerVis }, repository_related_id: { _id: repoId, visibility: repoVis } } = task, rest = __rest(task, ["layer_related_id", "repository_related_id"]);
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'layer._id': layerId });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'repository._id': repoId });
                if (evalAccess(cLayer, cRepo, layerVis, repoVis)) {
                    return Object.assign(Object.assign({}, rest), { layer_related_id: layerId, repository_related_id: repoId });
                }
                ;
            })))).filter(task => task !== undefined);
            const filteredTasksBaseOnLevel = [...filteredTasksBaseOnAccess, ...uniqueTasksOnOpenParents];
            const completedTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'completed');
            const approvalTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'approval');
            req.completedTasks = completedTasks;
            req.approvalTasks = approvalTasks;
            next();
        }
        else {
            const tasks = yield taskSchema_1.default.find({ project: projectID, status: { $in: ['completed'] } })
                .populate('layer_related_id repository_related_id')
                .lean();
            // ! Tareas en el caso de que el usuario sea un guest
            const filteredTasksForGuests = tasks.reduce((acc, task) => {
                const { layer_related_id, repository_related_id } = task;
                if (layer_related_id && repository_related_id && levels.includes(layer_related_id.visibility) && levels.includes(repository_related_id.visibility)) {
                    const taskWithIdsOnly = Object.assign(Object.assign({}, task), { layer_related_id: layer_related_id._id, repository_related_id: repository_related_id._id });
                    acc.push(taskWithIdsOnly);
                }
                ;
                return acc;
            }, []);
            req.completedTasks = filteredTasksForGuests;
            req.approvalTasks = [];
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
exports.getProjectTasksBaseOnAccess = getProjectTasksBaseOnAccess;
const validateCollaboratorAccess = (minAccess) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { project, owner } = req;
        const { projectID } = req.params;
        const { uid, layerID, repoID, } = req.query;
        try {
            if (project.owner.toString() === uid) {
                req.type = 'owner';
                return next();
            }
            const collaboratorOnProject = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'project._id': projectID });
            if (!collaboratorOnProject) {
                return res.status(401).json({
                    success: false,
                    message: 'You do not have access to this resource'
                });
            }
            ;
            if (minAccess.includes(collaboratorOnProject.project.accessLevel)) {
                req.collaborator = collaboratorOnProject;
                req.type = 'collaborator';
                return next();
            }
            ;
            const collaboratorOnLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'layer._id': layerID });
            if (collaboratorOnLayer && minAccess.includes(collaboratorOnLayer.layer.accessLevel)) {
                req.collaborator = collaboratorOnLayer;
                req.type = 'collaborator';
                return next();
            }
            ;
            const collaboratorOnRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'repository._id': repoID });
            if (collaboratorOnRepo && minAccess.includes(collaboratorOnRepo.repository.accessLevel)) {
                req.collaborator = collaboratorOnRepo;
                req.type = 'collaborator';
                return next();
            }
            ;
            return res.status(401).json({
                success: false,
                message: 'You do not have access to this resource'
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server error',
                error
            });
        }
    });
};
exports.validateCollaboratorAccess = validateCollaboratorAccess;
//# sourceMappingURL=tasks-middlewares.js.map