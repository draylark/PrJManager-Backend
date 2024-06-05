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
exports.getProfileTasksFiltered = exports.getProjectTasksDates = exports.getTasksDates = exports.updateParticipation = exports.getCompletedTasksLength = exports.validateCollaboratorAccess = exports.getProjectTasksBaseOnAccess = exports.getProjectTasksBaseOnAccessForHeatMap = exports.getTaskData = exports.validateUserAccessForTaskData = exports.getTaskContributors = void 0;
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const noteSchema_1 = __importDefault(require("../models/noteSchema"));
const evalAccess = (cOnLayer, cOnRepo, lVisibility, RVisibility) => {
    if (cOnLayer && cOnRepo && cOnLayer.state && !cOnRepo.state && RVisibility === 'open') {
        return true;
    }
    if (cOnLayer && cOnRepo && !cOnLayer.state && lVisibility === 'open' && !cOnRepo.state && RVisibility === 'open') {
        return true;
    }
    return false;
};
const getTaskContributors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const task = yield taskSchema_1.default.findById(taskId)
            .select('commits_hashes');
        const contributorsData = yield taskSchema_1.default.findById(taskId)
            .populate({
            path: 'contributorsIds',
            select: 'username photoUrl _id'
        });
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }
        req.hashes = task.commits_hashes;
        req.contributorsData = contributorsData.contributorsIds;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getTaskContributors = getTaskContributors;
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
const getTaskData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const task = yield taskSchema_1.default.findById(taskId)
            .populate({
            path: 'layer_related_id',
            select: 'name _id'
        })
            .populate({
            path: 'repository_related_id',
            select: 'name _id'
        })
            .populate({
            path: 'project',
            select: 'name _id'
        })
            .populate({
            path: 'readyContributors.uid',
            select: 'username photoUrl _id'
        })
            .populate({
            path: 'reasons_for_rejection.uid',
            select: 'username photoUrl _id'
        });
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }
        req.task = task;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getTaskData = getTaskData;
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
            // ! Tareas en el caso de que el usuario sea un guest
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
                req.authorized = owner;
                req.type = 'authorized';
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
                req.authorized = collaboratorOnProject;
                req.type = 'authorized';
                return next();
            }
            ;
            const collaboratorOnLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'layer._id': layerID });
            if (collaboratorOnLayer && minAccess.includes(collaboratorOnLayer.layer.accessLevel)) {
                req.authorized = collaboratorOnLayer;
                req.type = 'authorized';
                return next();
            }
            ;
            const collaboratorOnRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'repository._id': repoID });
            if (collaboratorOnRepo && minAccess.includes(collaboratorOnRepo.repository.accessLevel)) {
                req.authorized = collaboratorOnRepo;
                req.type = 'authorized';
                return next();
            }
            ;
            req.type = 'no-authorized';
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
const getCompletedTasksLength = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { currentYear, currentMonth } = req.query;
    // Convertir a números si no lo son, ya que los parámetros de la consulta son recibidos como strings
    const year = Number(currentYear);
    const month = Number(currentMonth);
    if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({
            message: "Invalid year or month"
        });
    }
    // Ajuste para el índice de mes correcto (-1 si los meses vienen de 1 a 12)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
        return res.status(400).json({
            message: "Generated dates are invalid."
        });
    }
    let assignedfilter = {
        assigned_to: uid,
        status: 'completed',
        updatedAt: {
            $gte: startDate,
            $lte: endDate
        }
    };
    let contributionsFilter = {
        contributorsIds: uid,
        status: 'completed',
        updatedAt: {
            $gte: startDate,
            $lte: endDate
        }
    };
    try {
        const tasks = yield taskSchema_1.default.find(assignedfilter)
            .sort({ updatedAt: -1 })
            .select('_id task_name');
        const contributions = yield taskSchema_1.default.find(contributionsFilter)
            .sort({ updatedAt: -1 })
            .select('_id task_name');
        const combinedTasks = [...tasks, ...contributions];
        const uniqueTasks = combinedTasks.filter((task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index);
        req.completedTasksLength = uniqueTasks.length;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getCompletedTasksLength = getCompletedTasksLength;
const allTaskContributorsReady = (contributorsIds, readyContributors) => {
    if (contributorsIds.length !== readyContributors.length) {
        return false;
    }
    const sortedContributorsIds = contributorsIds.slice().sort().map(id => id.toString());
    const sortedReadyContributors = readyContributors.slice().sort((a, b) => a.uid.toString().localeCompare(b.uid.toString()));
    for (let i = 0; i < sortedContributorsIds.length; i++) {
        if (sortedContributorsIds[i] !== sortedReadyContributors[i].uid.toString()) {
            return false;
        }
    }
    return true;
};
const updateParticipation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { uid, notes } = req.body; // Asegúrate de que uid sea un string.
    try {
        const task = yield taskSchema_1.default.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.type === "assigned") {
            const isContributor = task.contributorsIds.includes(uid);
            const itIsTheAssigned = task.assigned_to.toString() === uid;
            if (isContributor || itIsTheAssigned) {
                if (itIsTheAssigned) {
                    yield taskSchema_1.default.updateOne({ _id: taskId }, { $set: { readyContributors: task.contributorsIds.map(id => ({ uid: id, date: new Date(), me: false })) } });
                }
                else {
                    yield taskSchema_1.default.updateOne({ _id: taskId }, { $set: { readyContributors: { uid, date: new Date(), me: true } } });
                }
                // Convertir cada string de notes en un objeto que cumpla con noteSchema
                const formattedNotes = notes.map(noteText => ({ text: noteText, uid, task: taskId }));
                if (formattedNotes.length > 0) {
                    yield noteSchema_1.default.insertMany(formattedNotes);
                }
                if (itIsTheAssigned) {
                    return next();
                }
                return res.status(200).json({ message: 'Contributor marked as ready' });
            }
            else {
                return res.status(400).json({ message: 'User is not a contributor' });
            }
        }
        else {
            const isContributor = task.contributorsIds.includes(uid);
            if (isContributor) {
                const updatedTask = yield taskSchema_1.default.findOneAndUpdate({ _id: taskId }, { $addToSet: { readyContributors: { uid, date: new Date(), me: true } } }, { new: true } // Asegura que el documento retornado sea el actualizado      
                );
                // Convertir cada string de notes en un objeto que cumpla con noteSchema
                const formattedNotes = notes.map(noteText => ({ text: noteText, uid, task: taskId }));
                if (formattedNotes.length > 0) {
                    yield noteSchema_1.default.insertMany(formattedNotes);
                }
                if (updatedTask) {
                    const isReady = allTaskContributorsReady(updatedTask.contributorsIds, updatedTask.readyContributors);
                    if (isReady) {
                        console.log('Task is ready');
                        return next();
                    }
                }
                console.log('Task is not ready');
                return res.status(200).json({ message: 'Contributor marked as ready' });
            }
            else {
                return res.status(400).json({ message: 'User is not a contributor' });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred', error });
    }
});
exports.updateParticipation = updateParticipation;
const getTasksDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    try {
        // ! ASSIGNED
        // ? Creacion de tarea
        const taskSet0 = yield taskSchema_1.default.find({
            creator: uid,
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('createdAt task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Envio a revision de tarea asignada
        const tasksSet1 = yield taskSchema_1.default.find({
            assigned_to: uid,
            // completed_at: null,
            reviewSubmissionDate: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('reviewSubmissionDate task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea asignada y aprobada
        const tasksSet2 = yield taskSchema_1.default.find({
            assigned_to: uid,
            status: 'completed',
            completed_at: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('completed_at task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ! CONTRIBUTOR
        // ? Tarea enviada a revision en la que se es contribuidor
        const tasksSet3 = yield taskSchema_1.default.find({
            assigned_to: { $ne: uid },
            contributorsIds: uid,
            // completed_at: null,
            reviewSubmissionDate: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('reviewSubmissionDate task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea aprobada en la que se es contribuidor
        const tasksSet4 = yield taskSchema_1.default.find({
            assigned_to: { $ne: uid },
            contributorsIds: uid,
            status: 'completed',
            completed_at: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('completed_at task_name assigned_to _id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea en la que se es contribuidor y terminaste tus contribuiciones
        const tasksSet5 = yield taskSchema_1.default.find({
            assigned_to: { $ne: uid },
            me: true,
            contributorsIds: uid,
            readyContributors: { $elemMatch: { uid, date: { $gte: startDate, $lte: endDate } } }
        })
            .sort({ updatedAt: -1 })
            .select('completed_at task_name assigned_to _id repository_related_id readyContributors')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        })
            .lean();
        const filteredTasksSet5 = tasksSet5.map(task => {
            const { readyContributors } = task, rest = __rest(task, ["readyContributors"]);
            const matchedContributor = readyContributors.find(contributor => contributor.uid.toString() === uid &&
                new Date(contributor.date) >= new Date(startDate) &&
                new Date(contributor.date) <= new Date(endDate));
            return Object.assign(Object.assign({}, rest), { readyContributorData: matchedContributor ? matchedContributor : {} });
        });
        // Puedes adjuntar los conjuntos de tareas a la solicitud para usarlos más adelante si es necesario
        req.tasks = { taskSet0, tasksSet1, tasksSet2, tasksSet3, tasksSet4, tasksSet5: filteredTasksSet5 };
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error,
        });
    }
});
exports.getTasksDates = getTasksDates;
const getProjectTasksDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { startDate, endDate, uid } = req.query;
    try {
        // ? Creacion de tarea
        const taskSet0 = yield taskSchema_1.default.find({
            project: projectId,
            creator: uid,
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('createdAt task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Envio a revision de tarea asignada
        const tasksSet1 = yield taskSchema_1.default.find({
            project: projectId,
            assigned_to: uid,
            status: 'approval',
            completed_at: null,
            reviewSubmissionDate: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('reviewSubmissionDate task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea asignada y aprobada
        const tasksSet2 = yield taskSchema_1.default.find({
            project: projectId,
            assigned_to: uid,
            status: 'completed',
            completed_at: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('completed_at task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea enviada a revision en la que se es contribuidor
        const tasksSet3 = yield taskSchema_1.default.find({
            project: projectId,
            assigned_to: { $ne: uid },
            contributorsIds: uid,
            status: 'approval',
            completed_at: null,
            reviewSubmissionDate: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('reviewSubmissionDate task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea aprobada en la que se es contribuidor
        const tasksSet4 = yield taskSchema_1.default.find({
            project: projectId,
            assigned_to: { $ne: uid },
            contributorsIds: uid,
            status: 'completed',
            completed_at: { $gte: startDate, $lte: endDate },
        })
            .sort({ updatedAt: -1 })
            .select('completed_at task_name assigned_to _id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // ? Tarea aprobada en la que se es contribuidor y se marco como lista
        const tasksSet5 = yield taskSchema_1.default.find({
            project: projectId,
            assigned_to: { $ne: uid },
            contributorsIds: uid,
            status: 'completed',
            readyContributors: { $elemMatch: { uid, date: { $gte: startDate, $lte: endDate } } },
        })
            .sort({ updatedAt: -1 })
            .select('completed_at task_name assigned_to _id repository_related_id')
            .populate({
            path: 'repository_related_id',
            select: 'name'
        });
        // Puedes adjuntar los conjuntos de tareas a la solicitud para usarlos más adelante si es necesario
        req.tasks = { taskSet0, tasksSet1, tasksSet2, tasksSet3, tasksSet4, tasksSet5 };
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error,
        });
    }
});
exports.getProjectTasksDates = getProjectTasksDates;
const getProfileTasksFiltered = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { year } = req.query;
    let matchCondition = { assigned_to: uid };
    if (year) {
        matchCondition = Object.assign(Object.assign({}, matchCondition), { completed_at: {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            } });
    }
    try {
        const tasks = yield taskSchema_1.default.find(matchCondition)
            .sort({ updatedAt: -1 })
            .select('createdAt task_name assigned_to _id project layer_related_id repository_related_id')
            .populate('repository_related_id', 'visibility name')
            .populate('layer_related_id', 'visibility name')
            .populate('project', 'visibility name');
        const filteredTasks = tasks.reduce((acc, task) => {
            const { project, layer_related_id, repository_related_id } = task;
            if (validateVisibility(project.visibility, layer_related_id.visibility, repository_related_id.visibility)) {
                acc.push(task);
            }
            return acc;
        }, []);
        req.tasks = filteredTasks;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getProfileTasksFiltered = getProfileTasksFiltered;
const validateVisibility = (pVisisibility, lVisibility, rVisibility) => {
    if (pVisisibility === 'public' && lVisibility === 'open' && rVisibility === 'open') {
        return true;
    }
    return false;
};
//# sourceMappingURL=tasks-middlewares.js.map