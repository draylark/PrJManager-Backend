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
exports.getCreatedProjectsDates = exports.getProjectsLength = exports.returnDataBaseOnAccessLevel = exports.updateOtherCollaboratorDataOfDeletedCollaborators = exports.deleteCollaborators = exports.updateOtherCDataOfProjectModifiedCollaborators = exports.updateCollaborators = exports.handlePrJCollaboratorInvitation = exports.createOtherCDataOfProjectCreatedCollaborators = exports.newCollaborators = exports.itIsTheOwner = exports.ownerOrCollaborator = exports.validateCollaboratorAccessOnProject = exports.validateUserAccessOnProject = exports.validateUserAccessBaseOnProjectVisibility = exports.validateUserProjects = exports.validateProjectVisibility = exports.validateProjectExistance = exports.createProject = exports.whatIsTheAccess = void 0;
const projectSchema_1 = __importDefault(require("../../models/projectSchema"));
const layerSchema_1 = __importDefault(require("../../models/layerSchema"));
const repoSchema_1 = __importDefault(require("../../models/repoSchema"));
const collaboratorSchema_1 = __importDefault(require("../../models/collaboratorSchema"));
const notisSchema_1 = __importDefault(require("../../models/notisSchema"));
const userSchema_1 = __importDefault(require("../../models/userSchema"));
// ! Middlewares Helpers
const whatIsTheAccess = (accessLevel) => {
    switch (accessLevel) {
        case 'guest':
            return {
                levels: ['open'],
            };
        case 'contributor':
            return {
                levels: ['open', 'internal'],
            };
        case 'coordinator':
            return {
                levels: ['open', 'internal'],
            };
        case 'manager':
        case 'administrator':
            return {
                levels: ['open', 'internal', 'restricted'],
            };
        case null:
            return {
                levels: ['open'],
            };
        default:
            return { levels: ['open'] };
    }
    ;
};
exports.whatIsTheAccess = whatIsTheAccess;
const appropiateLevelAccessOnLayer = (accessLevel) => {
    switch (accessLevel) {
        case 'contributor':
            return 'contributor';
        case 'coordinator':
            return 'coordinator';
        case 'manager':
            return 'manager';
        case 'administrator':
            return 'administrator';
        default:
            return 'contributor';
    }
    ;
};
const appropiateLevelAccessOnRepo = (accessLevel) => {
    switch (accessLevel) {
        case 'contributor':
            return 'reader';
        case 'coordinator':
            return 'editor';
        case 'manager':
            return 'manager';
        case 'administrator':
            return 'administrator';
        default:
            return 'contributor';
    }
    ;
};
// ! Project Crud
const createProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { readmeContent } = _a, rest = __rest(_a, ["readmeContent"]);
    const { uid } = req.query;
    try {
        const project = new projectSchema_1.default(Object.assign(Object.assign({}, rest), { owner: uid }));
        yield project.save();
        yield userSchema_1.default.findByIdAndUpdate(uid, { $inc: { projects: 1 } }, { new: true });
        req.project = project;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.createProject = createProject;
// ! Project Validation
const validateProjectExistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const project = yield projectSchema_1.default.findById(projectID);
    const owner = yield userSchema_1.default.findById(project === null || project === void 0 ? void 0 : project.owner);
    if (!project) {
        return res.status(400).json({
            success: false,
            message: 'Project does not exist',
            type: 'project-validation'
        });
    }
    if (!owner) {
        return res.status(400).json({
            success: false,
            message: 'Owner does not exist',
            type: 'project-validation'
        });
    }
    req.project = project;
    req.owner = owner;
    next();
});
exports.validateProjectExistance = validateProjectExistance;
const validateProjectVisibility = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { project } = req;
    const { uid } = req.query;
    if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
        req.owner = true;
        return next();
    }
    try {
        if ((project === null || project === void 0 ? void 0 : project.visibility) === 'public') {
            req.type = 'public';
            req.owner = false;
            return next();
        }
        else {
            req.type = 'private';
            req.owner = false;
            return next();
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.validateProjectVisibility = validateProjectVisibility;
const validateUserProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.query;
    const projects = yield projectSchema_1.default.find({ owner: uid });
    if (projects.length >= 3) {
        return res.status(400).json({
            success: false,
            message: 'You have reached the limit of projects you can create.',
            type: 'projects-limit'
        });
    }
    next();
});
exports.validateUserProjects = validateUserProjects;
// ! Collaborator Validation
const validateUserAccessBaseOnProjectVisibility = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { project } = req;
    const { uid } = req.query;
    const { projectID } = req.params;
    if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
        req.owner = true;
        return next();
    }
    try {
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'project._id': projectID });
        if ((project === null || project === void 0 ? void 0 : project.visibility) === 'public') {
            if (!collaborator) {
                req.accessLevel = 'guest';
                return next();
            }
            else {
                req.accessLevel = (_b = collaborator === null || collaborator === void 0 ? void 0 : collaborator.project) === null || _b === void 0 ? void 0 : _b.accessLevel;
                return next();
            }
        }
        else {
            if (!collaborator) {
                return res.status(400).json({
                    success: false,
                    message: 'This project is private and you do not have access as collaborator.',
                    type: 'collaborator-validation'
                });
            }
            else {
                req.accessLevel = (_c = collaborator === null || collaborator === void 0 ? void 0 : collaborator.project) === null || _c === void 0 ? void 0 : _c.accessLevel;
                return next();
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.validateUserAccessBaseOnProjectVisibility = validateUserAccessBaseOnProjectVisibility;
const validateUserAccessOnProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const { project } = req;
    const uid = req.query.uid;
    if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
        req.type = 'owner';
        req.owner = true;
        return next();
    }
    try {
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, 'project._id': project === null || project === void 0 ? void 0 : project._id, state: true });
        if (!collaborator) {
            req.type = 'guest';
            req.owner = false;
            req.levels = ['open'];
            return next();
        }
        const { levels } = (0, exports.whatIsTheAccess)((_e = (_d = collaborator === null || collaborator === void 0 ? void 0 : collaborator.project) === null || _d === void 0 ? void 0 : _d.accessLevel) !== null && _e !== void 0 ? _e : null);
        req.type = 'collaborator';
        req.owner = false;
        req.levels = levels;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.validateUserAccessOnProject = validateUserAccessOnProject;
const validateCollaboratorAccessOnProject = (minAccess) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { project } = req;
        const { projectID } = req.params;
        const uid = req.query.uid;
        if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
            return next();
        }
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'project._id': projectID });
        if (!collaborator) {
            return res.status(400).json({
                success: false,
                message: 'You do not have access to this project',
                type: 'collaborator-validation'
            });
        }
        if (!minAccess.includes((_b = (_a = collaborator === null || collaborator === void 0 ? void 0 : collaborator.project) === null || _a === void 0 ? void 0 : _a.accessLevel) !== null && _b !== void 0 ? _b : 'no-access')) {
            return res.status(400).json({
                success: false,
                message: 'You do not have the required access level to perform this action',
                type: 'collaborator-validation'
            });
        }
        next();
    });
};
exports.validateCollaboratorAccessOnProject = validateCollaboratorAccessOnProject;
const ownerOrCollaborator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h;
    const { projectID } = req.params;
    const project = req.project;
    const uid = (_f = req === null || req === void 0 ? void 0 : req.user) === null || _f === void 0 ? void 0 : _f._id;
    if (uid && (project === null || project === void 0 ? void 0 : project.owner.toString()) === uid.toString()) {
        req.type = 'owner';
        return next();
    }
    else {
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, 'project._id': projectID });
        if (!collaborator) {
            return res.status(400).json({
                message: 'You do not have access to this project'
            });
        }
        const { levels } = (0, exports.whatIsTheAccess)((_h = (_g = collaborator === null || collaborator === void 0 ? void 0 : collaborator.project) === null || _g === void 0 ? void 0 : _g.accessLevel) !== null && _h !== void 0 ? _h : null);
        if (!levels.includes('open')) {
            return res.status(400).json({
                message: 'You do not have access to this project'
            });
        }
        req.type = 'collaborator';
        req.levels = levels;
        next();
    }
});
exports.ownerOrCollaborator = ownerOrCollaborator;
const itIsTheOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { project } = req;
    const { uid } = req.query;
    try {
        if ((project === null || project === void 0 ? void 0 : project.owner.toString()) !== uid) {
            return res.status(400).json({
                success: false,
                message: 'You do not have the required access level to perform this action',
                type: 'collaborator-validation'
            });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.itIsTheOwner = itIsTheOwner;
// ! Collaborators Creation
const newCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { newCollaborators } = req.body;
    const { project } = req;
    if (newCollaborators.length === 0) {
        req.invMiddlewareState = false;
        return next();
    }
    try {
        yield Promise.all(newCollaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
            var _j, _k, _l;
            const noti = new notisSchema_1.default({
                type: 'project-invitation',
                title: 'Project Invitation',
                description: `You have been invited to collaborate on project`,
                recipient: collaborator.id,
                from: { name: (_j = req === null || req === void 0 ? void 0 : req.user) === null || _j === void 0 ? void 0 : _j.username, ID: (_k = req === null || req === void 0 ? void 0 : req.user) === null || _k === void 0 ? void 0 : _k._id, photoUrl: ((_l = req === null || req === void 0 ? void 0 : req.user) === null || _l === void 0 ? void 0 : _l.photoUrl) || null },
                additionalData: {
                    date: new Date(),
                    project_name: project === null || project === void 0 ? void 0 : project.name,
                    projectID: projectID,
                    accessLevel: collaborator.accessLevel,
                }
            });
            noti.save();
        })));
        req.invMiddlewareState = true;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.newCollaborators = newCollaborators;
const createOtherCDataOfProjectCreatedCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { uid, name, photoUrl, accessLevel, requestStatus } = req.body;
    if (requestStatus === 'reject') {
        return next();
    }
    ;
    try {
        const layers = yield layerSchema_1.default.find({ project: projectID, 'visibility': { $exists: true } });
        const repos = yield repoSchema_1.default.find({ projectID: projectID, 'visibility': { $exists: true } })
            .populate('layerID');
        yield Promise.all(layers.map((layer) => __awaiter(void 0, void 0, void 0, function* () {
            const { levels } = (0, exports.whatIsTheAccess)(accessLevel);
            let existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'layer._id': layer._id });
            if (existingCollaborator && !existingCollaborator.state) {
                if (levels.includes(layer.visibility)) {
                    yield collaboratorSchema_1.default.updateOne({ uid, projectID, 'layer._id': layer._id }, { $set: { state: true, 'layer.accessLevel': appropiateLevelAccessOnLayer(accessLevel) } });
                }
            }
            else {
                // Crear el colaborador en la capa si tiene acceso
                if (levels.includes(layer.visibility)) {
                    console.log('Creando nuevo colaborador en capa');
                    const c = new collaboratorSchema_1.default({ uid, name, photoUrl, projectID, layer: { _id: layer._id, accessLevel: appropiateLevelAccessOnLayer(accessLevel) }, state: true });
                    yield c.save();
                }
            }
            ;
        })));
        yield Promise.all(repos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
            var _m;
            const visibility = (_m = repo.layerID) === null || _m === void 0 ? void 0 : _m.visibility; // Aserción de tipo y operador opcional
            const { levels } = (0, exports.whatIsTheAccess)(accessLevel);
            // Crear el colaborador en el repositorio si tiene acceso
            let existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'repository._id': repo._id });
            if (existingCollaborator && !existingCollaborator.state) {
                if (levels.includes(repo.visibility) && levels.includes(visibility)) {
                    yield collaboratorSchema_1.default.updateOne({ uid, projectID, 'repository._id': repo._id }, { $set: { state: true, 'repository.accessLevel': appropiateLevelAccessOnRepo(accessLevel) } });
                }
            }
            else {
                if (levels.includes(repo.visibility) && levels.includes(visibility)) {
                    const c = new collaboratorSchema_1.default({ uid, name, projectID, photoUrl, repository: { _id: repo._id, accessLevel: appropiateLevelAccessOnRepo(accessLevel) }, state: true });
                    yield c.save();
                }
            }
            ;
        })));
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.createOtherCDataOfProjectCreatedCollaborators = createOtherCDataOfProjectCreatedCollaborators;
const handlePrJCollaboratorInvitation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { uid, name, photoUrl, accessLevel, notiID, requestStatus } = req.body;
    try {
        if (requestStatus === 'accept') {
            const existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid, 'project._id': projectID });
            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    yield collaboratorSchema_1.default.updateOne({ uid, projectID, 'project._id': projectID }, { $set: { state: true, name, photoUrl, 'project.accessLevel': accessLevel } });
                    yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
                    return next();
                }
            }
            else {
                const c = new collaboratorSchema_1.default({ uid, name, photoUrl, projectID, project: { _id: projectID, accessLevel }, state: true });
                yield c.save();
                yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
                return next();
            }
        }
        else {
            yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
            return next();
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
});
exports.handlePrJCollaboratorInvitation = handlePrJCollaboratorInvitation;
// ! Collaborators Update
const updateCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { modifiedCollaborators } = req.body;
    if (modifiedCollaborators.length === 0) {
        req.updatingMiddlewareState = false;
        return next();
    }
    ;
    try {
        yield Promise.all(modifiedCollaborators.map((colab) => {
            const { id, accessLevel } = colab;
            return collaboratorSchema_1.default.findOneAndUpdate({ uid: id, 'project._id': projectID }, { 'project.accessLevel': accessLevel });
        }));
        // Este código no se ejecuta hasta que todas las promesas en el arreglo hayan sido resueltas
        req.updatingMiddlewareState = true;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.updateCollaborators = updateCollaborators;
const updateOtherCDataOfProjectModifiedCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { modifiedCollaborators } = req.body;
    const { projectLayers, projectRepos } = req;
    if (modifiedCollaborators.length === 0) {
        return next();
    }
    try {
        // Obtener todas las capas y repositorios del proyecto
        const layers = (projectLayers === null || projectLayers === void 0 ? void 0 : projectLayers.length) !== 0
            ? projectLayers
            : yield layerSchema_1.default.find({ project: projectID, 'visibility': { $exists: true } });
        const repos = (projectRepos === null || projectRepos === void 0 ? void 0 : projectRepos.length) !== 0
            ? projectRepos
            : yield repoSchema_1.default.find({ projectID: projectID, 'visibility': { $exists: true } })
                .populate('layerID');
        // Actualizar los colaboradores en las capas y repositorios
        if (layers && layers.length !== 0) {
            yield Promise.all(modifiedCollaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
                const { levels } = (0, exports.whatIsTheAccess)(collaborator.accessLevel);
                // Asunción: `Layer` es el modelo de las capas
                yield Promise.all(layers.map((layer) => __awaiter(void 0, void 0, void 0, function* () {
                    const existingCollaborator = yield collaboratorSchema_1.default.findOne({ 'layer._id': layer._id, uid: collaborator.id });
                    if (!levels.includes(layer.visibility)) {
                        if (existingCollaborator) {
                            // Si el colaborador ya no debería tener acceso a la capa, actualiza el estado a false
                            yield collaboratorSchema_1.default.updateOne({ _id: existingCollaborator._id }, { $set: { state: false } });
                        }
                        // No hacer nada si el colaborador no tiene un documento de colaborador en esta capa
                    }
                    else {
                        if (existingCollaborator) {
                            // Si el colaborador debería tener acceso y ya tiene un documento, actualiza el estado a true y el nivel de acceso
                            yield collaboratorSchema_1.default.updateOne({ _id: existingCollaborator._id }, { $set: { state: true, 'layer.accessLevel': appropiateLevelAccessOnLayer(collaborator.accessLevel) } });
                        }
                        else {
                            // Si el colaborador debería tener acceso pero no tiene un documento, crea uno nuevo
                            const newCollaborator = new collaboratorSchema_1.default({
                                layer: { _id: layer._id, accessLevel: appropiateLevelAccessOnLayer(collaborator.accessLevel) },
                                projectID,
                                uid: collaborator.id,
                                name: collaborator.name,
                                photoUrl: collaborator.photoUrl || null,
                                state: true // Asumiendo que el estado por defecto es true
                                // Añade otros campos requeridos según tu esquema de colaborador
                            });
                            yield newCollaborator.save();
                        }
                    }
                })));
            })));
        }
        if (repos && repos.length !== 0) {
            yield Promise.all(modifiedCollaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
                const { levels } = (0, exports.whatIsTheAccess)(collaborator.accessLevel);
                yield Promise.all(repos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
                    var _o;
                    const existingCollaborator = yield collaboratorSchema_1.default.findOne({ 'repository._id': repo._id, uid: collaborator.id })
                        .populate({
                        path: 'repository._id',
                        populate: { path: 'layerID' }
                    });
                    const layerVisibility = (_o = repo.layerID) === null || _o === void 0 ? void 0 : _o.visibility;
                    if (!levels.includes(repo.visibility) || !levels.includes(layerVisibility)) {
                        if (existingCollaborator) {
                            yield collaboratorSchema_1.default.updateOne({ _id: existingCollaborator._id }, { $set: { state: false } });
                        }
                    }
                    else {
                        if (existingCollaborator) {
                            // El colaborador debería tener acceso y ya existe, actualiza el estado a true y el nivel de acceso
                            yield collaboratorSchema_1.default.updateOne({ _id: existingCollaborator._id }, { $set: { state: true, 'repository.accessLevel': appropiateLevelAccessOnRepo(collaborator.accessLevel) } });
                        }
                        else {
                            // El colaborador debería tener acceso pero no existe un documento, créalo
                            const newCollaborator = new collaboratorSchema_1.default({
                                repository: { _id: repo._id, accessLevel: appropiateLevelAccessOnRepo(collaborator.accessLevel) },
                                projectID,
                                uid: collaborator.id,
                                name: collaborator.name,
                                photoUrl: collaborator.photoUrl || null,
                                state: true
                            });
                            yield newCollaborator.save();
                        }
                    }
                })));
            })));
        }
        req.projectLayers = layers;
        req.projectRepos = repos;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.updateOtherCDataOfProjectModifiedCollaborators = updateOtherCDataOfProjectModifiedCollaborators;
// ! Collaborators Deletion
const deleteCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { deletedCollaborators } = req.body;
    if (deletedCollaborators.length === 0) {
        req.totalDeletedCollaborators = 0;
        req.deletingMiddlewareState = false;
        return next();
    }
    try {
        // Ejecutar todas las operaciones de actualización y capturar los resultados
        const results = yield Promise.all(deletedCollaborators.map(id => {
            return collaboratorSchema_1.default.updateMany({ uid: id, 'project._id': projectID }, { $set: { state: false } });
        }));
        const totalModified = results.reduce((acc, result) => acc + result.modifiedCount, 0);
        // Almacenar el total de colaboradores eliminados en el objeto de solicitud para su uso posterior
        req.totalDeletedCollaborators = totalModified;
        req.deletingMiddlewareState = true;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.deleteCollaborators = deleteCollaborators;
const updateOtherCollaboratorDataOfDeletedCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { deletedCollaborators } = req.body;
    if (deletedCollaborators.length === 0) {
        req.projectLayers = [];
        req.projectRepos = [];
        return next();
    }
    try {
        const layers = yield layerSchema_1.default.find({ project: projectID });
        const repos = yield repoSchema_1.default.find({ projectID: projectID });
        yield Promise.all(layers.map(layer => collaboratorSchema_1.default.updateMany({ 'layer._id': layer._id, uid: { $in: deletedCollaborators.map(id => id) } }, { $set: { state: false } })));
        yield Promise.all(repos.map(repo => collaboratorSchema_1.default.updateMany({ 'repository._id': repo._id, uid: { $in: deletedCollaborators.map(id => id) } }, { $set: { state: false } })));
        req.projectLayers = layers;
        req.projectRepos = repos;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.updateOtherCollaboratorDataOfDeletedCollaborators = updateOtherCollaboratorDataOfDeletedCollaborators;
// ! Collaborator Propper Data Return based on access level
const returnDataBaseOnAccessLevel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    const { projectID } = req.params;
    const { accessLevel } = req.body;
    const uid = (_p = req === null || req === void 0 ? void 0 : req.user) === null || _p === void 0 ? void 0 : _p._id;
    const { type } = req;
    if (type === 'owner') {
        return next();
    }
    const { levels } = (0, exports.whatIsTheAccess)(accessLevel);
    try {
        const layersBaseOnLevel = yield collaboratorSchema_1.default.find({
            uid,
            projectID,
            state: true,
            'layer._id': { $exists: true },
            'layer.visibility': { $in: levels } // Filtra directamente en la consulta
        }).populate('layer._id');
        const reposBaseOnLevel = yield collaboratorSchema_1.default.find({
            uid,
            projectID,
            state: true,
            'repository._id': { $exists: true },
            'repository.visibility': { $in: levels } // Filtra directamente en la consulta
        }).populate('repository._id');
        return res.json({
            layers: layersBaseOnLevel,
            repos: reposBaseOnLevel
        });
    }
    catch (error) {
        console.log('err en returnDataBaseOnAccessLevel', error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.returnDataBaseOnAccessLevel = returnDataBaseOnAccessLevel;
// ! Project(s) Data
const getProjectsLength = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const myProjects = yield projectSchema_1.default.find({ owner: uid })
            .select('_id');
        const collaboratorProjects = yield collaboratorSchema_1.default.find({ uid, state: true, 'project._id': { $exists: true } })
            .select('_id');
        const projectsLength = myProjects.length + collaboratorProjects.length;
        req.projectsLength = projectsLength;
        next();
    }
    catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getProjectsLength = getProjectsLength;
const getCreatedProjectsDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    try {
        const createdProjects = yield projectSchema_1.default.find({
            owner: uid,
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .select('_id name createdAt owner');
        req.createdProjects = createdProjects;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getCreatedProjectsDates = getCreatedProjectsDates;
//# sourceMappingURL=project-middlewares.js.map