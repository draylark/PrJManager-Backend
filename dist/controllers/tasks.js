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
exports.getProfileTasks = exports.handleTaskInvitation = exports.deleteTaskContributor = exports.updateTaskContributors = exports.getTaskContributors = exports.deleteNote = exports.updateNote = exports.getTaskNotes = exports.getTasksForDashboard = exports.getTopProjectsTasks = exports.getUserTasks = exports.sendTaskToRevision = exports.updateTaskStatus = exports.getTasksByProject = exports.getRepoTasksDataForHeatMap = exports.getProyectTasksDataForHeatMap = exports.getTasksByRepo = exports.completeTask = exports.putTask = exports.getTasks = exports.getTaskCommits = exports.getTaskById = exports.createNewTask = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const noteSchema_1 = __importDefault(require("../models/noteSchema"));
const createNewTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { assigned_to } = _a, rest = __rest(_a, ["assigned_to"]);
    const { repo } = req;
    try {
        const task = new taskSchema_1.default(assigned_to ? Object.assign(Object.assign({}, rest), { assigned_to }) : rest);
        yield task.save();
        if (assigned_to) {
            const noti = new notisSchema_1.default({
                type: 'task-assignation',
                title: 'Task assignation',
                description: `You have been assigned to the task "${task.task_name}"`,
                from: {
                    name: 'System',
                    ID: task.project
                },
                recipient: assigned_to,
                additionalData: {
                    date: new Date(),
                    taskName: task.task_name,
                    taskId: task._id,
                    repositoryName: repo === null || repo === void 0 ? void 0 : repo.name
                }
            });
            yield noti.save();
        }
        return res.json({
            task,
            message: 'Task created'
        });
    }
    catch (error) {
        console.log(req.body);
        console.log(error);
        return res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.createNewTask = createNewTask;
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const task = yield taskSchema_1.default.findById(taskId);
        res.json(task);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getTaskById = getTaskById;
const getTaskCommits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { task, commits } = req;
    try {
        res.json({
            task,
            commits
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getTaskCommits = getTaskCommits;
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tasks = yield taskSchema_1.default.find({ createdBy: id }).sort({ createdAt: -1 });
    res.json({
        tasks
    });
});
exports.getTasks = getTasks;
const putTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = req.body, { _id } = _b, rest = __rest(_b, ["_id"]);
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
const completeTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _c = req.body, { _id } = _c, rest = __rest(_c, ["_id"]);
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
    console.log('repoID', repoID);
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
    const queryYear = req.query.year;
    const year = parseInt(queryYear, 10); // Asegúrate de convertir el año a número
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
const getRepoTasksDataForHeatMap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const queryYear = req.query.year;
    const year = parseInt(queryYear, 10); // Asegúrate de convertir el año a número
    try {
        let matchCondition = { repository_related_id: repoID, status: 'completed' };
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
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getRepoTasksDataForHeatMap = getRepoTasksDataForHeatMap;
const getTasksByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const queryYear = req.query.year;
    const year = parseInt(queryYear, 10); // Asegúrate de convertir el año a número
    const { owner, completedTasks, approvalTasks } = req;
    try {
        if (owner && owner === true) {
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
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorized, type } = req;
    const { status, approved, reasons } = req.body;
    const { taskId, projectID } = req.params;
    const uid = req.query.uid;
    try {
        const task = yield taskSchema_1.default.findById(taskId)
            .populate('repository_related_id', 'name');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (type === 'authorized') {
            if (!approved) {
                const formattedReasons = reasons.map(reason => ({
                    uid: uid,
                    text: reason,
                    date: new Date(),
                    taskSubmissionDate: task.reviewSubmissionDate
                }));
                yield taskSchema_1.default.updateOne({ _id: taskId }, { $push: { reasons_for_rejection: { $each: formattedReasons } }, status: status, reviewSubmissionDate: null });
                yield Promise.all(task.contributorsIds.map((contributorId) => __awaiter(void 0, void 0, void 0, function* () {
                    const noti = new notisSchema_1.default({
                        type: 'task-rejected',
                        title: 'Task rejected',
                        description: `The task "${task.task_name}" with ID "${taskId}" has been rejected.`,
                        from: {
                            name: 'System',
                            ID: projectID
                        },
                        recipient: contributorId,
                        additionalData: {
                            date: new Date(),
                            reasons: req.body.reasons,
                            repoName: task.repository_related_id.name,
                            taskName: task.task_name,
                            taskId: taskId
                        }
                    });
                    yield noti.save();
                })));
                return res.json({
                    success: true,
                    message: 'Reasons Subbmited',
                    type: 'task-rejected'
                });
            }
            else {
                yield taskSchema_1.default.updateOne({ _id: taskId }, { status: status, completed_at: new Date() });
                yield projectSchema_1.default.updateOne({ _id: projectID }, { $inc: { completedTasks: 1 } });
                yield Promise.all(task.contributorsIds.map((contributorId) => __awaiter(void 0, void 0, void 0, function* () {
                    const noti = new notisSchema_1.default({
                        type: 'task-approved',
                        title: 'Task approved',
                        description: `The task "${task.task_name}" with ID "${taskId}" has been approved.`,
                        from: {
                            name: 'System',
                            ID: projectID,
                        },
                        recipient: contributorId,
                        additionalData: {
                            date: new Date(),
                            repositoryName: task.repository_related_id.name,
                            taskName: task.task_name,
                            taskId: taskId
                        }
                    });
                    yield noti.save();
                })));
                return res.json({
                    success: true,
                    message: 'Task Approved',
                    type: 'task-approved'
                });
            }
        }
        else {
            return res.status(403).json({
                message: 'User not authorized to update task status'
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
    ;
});
exports.updateTaskStatus = updateTaskStatus;
const sendTaskToRevision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        yield taskSchema_1.default.updateOne({ _id: taskId }, {
            $set: {
                status: 'approval',
                reviewSubmissionDate: new Date()
            },
            $push: {
                reviewSubmissionDates: new Date()
            }
        });
        res.status(200).json({
            message: 'The task has been submitted for review.'
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred', error });
    }
});
exports.sendTaskToRevision = sendTaskToRevision;
const getUserTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const tasks = yield taskSchema_1.default.find({ assigned_to: uid })
            .sort({ createdAt: -1 })
            .select('_id repository_number_task  priority goals type deadline task_name task_description assigned_to status');
        const contributions = yield taskSchema_1.default.find({ contributorsIds: uid })
            .sort({ createdAt: -1 })
            .select('_id repository_number_task priority goals type deadline task_name task_description assigned_to status');
        // Combina las tareas y contribuciones
        const combinedTasks = [...tasks, ...contributions];
        // Filtra para obtener un conjunto único basado en `_id`
        const uniqueTasks = combinedTasks.filter((task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index);
        res.json({
            tasks: uniqueTasks,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            type: 'server-error'
        });
    }
});
exports.getUserTasks = getUserTasks;
const getTopProjectsTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const user = req.user;
    const projectIds = (user === null || user === void 0 ? void 0 : user.topProjects) ? user === null || user === void 0 ? void 0 : user.topProjects.map(project => project._id) : [];
    if ((user === null || user === void 0 ? void 0 : user.topProjects) && (user === null || user === void 0 ? void 0 : user.topProjects.length) === 0) {
        return res.status(404).json({
            message: "You haven't set any project as 'Top Project', highlight one in the 'Top Projects' panel to track it.",
            type: 'no-top-projects'
        });
    }
    try {
        const tasks = yield taskSchema_1.default.find({ assigned_to: uid, project: { $in: projectIds } })
            .sort({ createdAt: -1 })
            .populate('layer_related_id repository_related_id project')
            .populate({
            path: 'contributorsIds',
            select: '_id username photoUrl' // Incluye solo 'name' y 'email', excluye '_id'
        });
        const contributions = yield taskSchema_1.default.find({ contributorsIds: uid, project: { $in: projectIds } })
            .sort({ createdAt: -1 })
            .populate('layer_related_id repository_related_id project')
            .populate({
            path: 'contributorsIds',
            select: '_id username photoUrl' // Incluye solo 'name' y 'email', excluye '_id'
        });
        // Combina las tareas y contribuciones
        const combinedTasks = [...tasks, ...contributions];
        // Filtra para obtener un conjunto único basado en `_id`
        const uniqueTasks = combinedTasks.filter((task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index);
        res.json({
            tasks: uniqueTasks,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            type: 'server-error'
        });
    }
});
exports.getTopProjectsTasks = getTopProjectsTasks;
const getTasksForDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    // Crear un objeto de filtro base que incluye el usuario asignado.
    let assignedfilter = { assigned_to: uid, status: 'completed' };
    let contributionsFilter = { contributorsIds: uid, status: 'completed' };
    // Añadir filtros de fecha si se proporcionan ambos startDate y endDate.
    if (startDate && endDate) {
        assignedfilter['updatedAt'] = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
        contributionsFilter['updatedAt'] = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    const tasks = yield taskSchema_1.default.find(assignedfilter)
        .sort({ updatedAt: -1 })
        .select('_id task_name updatedAt');
    const contributions = yield taskSchema_1.default.find(contributionsFilter)
        .sort({ updatedAt: -1 })
        .select('_id task_name updatedAt');
    const combinedTasks = [...tasks, ...contributions];
    const uniqueTasks = combinedTasks.filter((task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index);
    res.json({
        tasks: uniqueTasks,
    });
});
exports.getTasksForDashboard = getTasksForDashboard;
const getTaskNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const notes = yield noteSchema_1.default.find({ task: taskId })
            .populate('uid', 'username photoUrl')
            .sort({ createdAt: -1 });
        res.json({
            notes
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getTaskNotes = getTaskNotes;
const updateNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { noteId } = req.params;
    const { text } = req.body;
    try {
        yield noteSchema_1.default.findOneAndUpdate({ _id: noteId }, { text });
        res.json({
            message: 'Note updated'
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.updateNote = updateNote;
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { noteId } = req.params;
    try {
        yield noteSchema_1.default.findByIdAndDelete(noteId);
        res.json({
            message: 'Note deleted'
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.deleteNote = deleteNote;
const getTaskContributors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contributorsCommitsData } = req;
    try {
        res.json({
            contributorsData: contributorsCommitsData
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getTaskContributors = getTaskContributors;
const updateTaskContributors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.query;
    const { taskId } = req.params;
    const { contributorsIds } = req.body;
    try {
        const task = yield taskSchema_1.default.findById(taskId)
            .select('assigned_to type _id task_name repository_related_id')
            .populate('assigned_to', 'username photoUrl _id')
            .populate('repository_related_id', 'name');
        if (!task) {
            return res.status(400).json({
                message: 'Task not found'
            });
        }
        // Verificar si el usuario es el asignado a la tarea y si la tarea está en estado 'assigned'
        if (task.type === 'assigned' && task.assigned_to._id.toString() === uid) {
            // Actualizar la lista de contributorsIds utilizando $addToSet para evitar duplicados
            yield Promise.all(contributorsIds.map((contributorId) => __awaiter(void 0, void 0, void 0, function* () {
                const noti = new notisSchema_1.default({
                    type: 'task-invitation',
                    title: 'Task invitation',
                    description: `You have been invited to participate in the assigned task`,
                    from: {
                        ID: task.assigned_to._id,
                        name: task.assigned_to.username,
                        photoUrl: task.assigned_to.photoUrl || null
                    },
                    recipient: contributorId,
                    additionalData: {
                        taskId,
                        taskName: task.task_name,
                        repositoryName: task.repository_related_id.name
                    }
                });
                yield noti.save();
            })));
            res.json({
                message: 'Invitation(s) sent successfully.'
            });
        }
        else {
            res.status(403).json({
                message: 'User not authorized to update contributors.'
            });
        }
    }
    catch (error) {
        console.error('Error updating task contributors:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
});
exports.updateTaskContributors = updateTaskContributors;
const deleteTaskContributor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.query;
    const { taskId } = req.params;
    const { contributorId } = req.body;
    try {
        const task = yield taskSchema_1.default.findById(taskId);
        if (!task) {
            return res.status(400).json({
                message: 'Task not found'
            });
        }
        // Verificar si el usuario es el asignado a la tarea y si la tarea está en estado 'assigned'
        if (task.type === 'assigned' && task.assigned_to.toString() === uid) {
            // Eliminar el contributorId de la lista de contributorsIds
            yield taskSchema_1.default.updateOne({ _id: taskId }, { $pull: { contributorsIds: contributorId } });
            res.json({
                message: 'Contributor removed successfully'
            });
        }
        else {
            res.status(403).json({
                message: 'User not authorized to remove contributor'
            });
        }
    }
    catch (error) {
        console.error('Error removing task contributor:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
});
exports.deleteTaskContributor = deleteTaskContributor;
const handleTaskInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { uid, accepted, notiId } = req.body;
    try {
        if (accepted) {
            yield taskSchema_1.default.findOneAndUpdate({ _id: taskId }, { $addToSet: { contributorsIds: uid } });
            yield notisSchema_1.default.findOneAndUpdate({ _id: notiId }, { status: false });
            return res.json({
                message: 'Invitation accepted'
            });
        }
        else {
            yield notisSchema_1.default.findOneAndDelete({ _id: notiId });
            return res.json({
                message: 'Invitation rejected succesfully.'
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.handleTaskInvitation = handleTaskInvitation;
const getProfileTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tasks } = req;
    try {
        res.json({
            tasks
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getProfileTasks = getProfileTasks;
//# sourceMappingURL=tasks.js.map