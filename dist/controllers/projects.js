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
exports.getMyProjectTimelineActivity = exports.handlePrJCollaboratorInvitation = exports.getProjectActivityData = exports.prjInvitationCallback = exports.response = exports.getReadme = exports.getCollaborators = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProject = exports.postProject = exports.getProjects = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const taskSchema_1 = __importDefault(require("../models/taskSchema"));
const readmeSchema_1 = __importDefault(require("../models/readmeSchema"));
const commitSchema_1 = __importDefault(require("../models/commitSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const myProjects = yield projectSchema_1.default.find({ owner: uid });
        const collaboratorProjects = yield collaboratorSchema_1.default.find({ uid, state: true, 'project._id': { $exists: true } })
            .populate('project._id')
            .lean();
        const projectsFromCollaborators = collaboratorProjects.reduce((acc, collaborator) => {
            // Desestructura para obtener el documento del proyecto poblado y el nivel de acceso directamente.
            const _a = collaborator.project, _b = _a._id, { _id } = _b, rest = __rest(_b, ["_id"]), { accessLevel } = _a;
            // Verifica si hay contenido relevante para agregar al acumulador.
            if (rest) {
                // Combina la información del proyecto poblado con el nivel de acceso y lo agrega al acumulador.
                acc.push(Object.assign(Object.assign({ pid: _id }, rest), { accessLevel }));
            }
            // Retorna el acumulador para la siguiente iteración.
            return acc;
        }, []); // Inicia con un array vacío como valor acumulado.
        res.json([...myProjects, ...projectsFromCollaborators]);
    }
    catch (error) {
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.getProjects = getProjects;
const postProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project } = req;
    const { readmeContent } = req.body;
    try {
        const readme = new readmeSchema_1.default({ project: project._id, content: readmeContent });
        yield readme.save();
        yield projectSchema_1.default.findByIdAndUpdate(project._id, { readme: readme._id }, { new: true });
        res.json({
            project,
            message: 'Your project has been created successfully!'
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
    const { accessLevel } = req;
    const { projectID } = req.params;
    try {
        if (!projectID)
            return res.status(400).json({
                success: false,
                message: 'Project id is required'
            });
        const project = yield projectSchema_1.default.findById(projectID);
        return res.json({
            project,
            accessLevel: accessLevel ? accessLevel : null
        });
    }
    catch (error) {
        return res.json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.getProjectById = getProjectById;
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const values = req.body;
    try {
        const project = yield projectSchema_1.default.findByIdAndUpdate(projectID, Object.assign(Object.assign({}, values), { lastUpdated: Date.now() }), { new: true });
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
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
exports.updateProject = updateProject;
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
const getCollaborators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    try {
        const collaborators = yield collaboratorSchema_1.default.find({ 'project._id': projectID, state: true });
        res.json({
            collaborators
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.getCollaborators = getCollaborators;
const getReadme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { readmeID } = req.params;
    try {
        const readme = yield readmeSchema_1.default.findById(readmeID);
        res.json({
            readmeContent: readme.content
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getReadme = getReadme;
const response = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invMiddlewareState, updatingMiddlewareState, deletingMiddlewareState, totalDeletedCollaborators } = req;
    const requestStatus = req.query.requestStatus;
    let messageParts = []; // Para acumular partes del mensaje basado en las operaciones realizadas
    // Crear mensajes según el estado de cada operación
    if (deletingMiddlewareState) {
        messageParts.push(`${totalDeletedCollaborators} collaborator(s) deleted.`);
    }
    if (updatingMiddlewareState) {
        messageParts.push("Collaborators updated successfully.");
    }
    if (invMiddlewareState) {
        messageParts.push("Invitation(s) sent.");
    }
    if (requestStatus && requestStatus === 'accept') {
        messageParts.push("Invitation accepted.");
    }
    if (requestStatus && requestStatus === 'reject') {
        messageParts.push("Invitation rejected.");
    }
    // Construir el mensaje final
    const finalMessage = messageParts.join(' ');
    // Enviar la respuesta
    res.json({
        success: true,
        message: finalMessage
    });
});
exports.response = response;
const prjInvitationCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestStatus } = req.body;
    try {
        if (requestStatus === 'accept') {
            res.json({
                message: 'Invitation accepted',
                accepted: true
            });
        }
        else {
            res.json({
                message: 'Invitation rejected',
                accepted: false
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
});
exports.prjInvitationCallback = prjInvitationCallback;
const getProjectActivityData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    try {
        const commits = yield commitSchema_1.default.find({ project: projectID })
            .select('-hash')
            .sort({ createdAt: -1 });
        const tasks = yield taskSchema_1.default.find({ project: projectID })
            .sort({ createdAt: -1 });
        res.json({
            commits,
            tasks
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getProjectActivityData = getProjectActivityData;
const handlePrJCollaboratorInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { uid, name, photoUrl, accessLevel, notiID } = req.body;
    const { requestStatus } = req.query;
    try {
        if (requestStatus === 'accept') {
            const existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid, 'project._id': projectID });
            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    yield collaboratorSchema_1.default.updateOne({ uid, 'project._id': projectID }, { $set: { state: true, name, photoUrl, 'project.accessLevel': accessLevel } });
                    yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
                    return res.json({
                        message: 'Collaborator added successfully'
                    });
                }
            }
            else {
                const c = new collaboratorSchema_1.default({ uid, name, photoUrl, project: { _id: projectID, accessLevel }, state: true });
                yield c.save();
                return res.json({
                    message: 'Collaborator added successfully'
                });
            }
        }
        else {
            yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
            return res.json({
                message: 'Invitation rejected'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
});
exports.handlePrJCollaboratorInvitation = handlePrJCollaboratorInvitation;
const getMyProjectTimelineActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { uid } = req.query;
});
exports.getMyProjectTimelineActivity = getMyProjectTimelineActivity;
//# sourceMappingURL=projects.js.map