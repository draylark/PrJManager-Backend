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
exports.returnDataBaseOnAccessLevel = exports.updateOtherCollaboratorDataOfDeletedCollaborators = exports.deleteCollaborators = exports.updateOtherCDataOfProjectModifiedCollaborators = exports.updateCollaborators = exports.handlePrJCollaboratorInvitation = exports.createOtherCDataOfProjectCreatedCollaborators = exports.newCollaborators = exports.itIsTheOwner = exports.ownerOrCollaborator = exports.validateCollaboratorAccessOnProject = exports.validateUserAccessOnProject = exports.validateProjectExistance = exports.whatIsTheAccess = void 0;
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const layerSchema_1 = __importDefault(require("../models/layerSchema"));
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
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
        default:
            return { levels: [] };
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
// ! Validation
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
    req.project = project;
    req.owner = owner;
    next();
});
exports.validateProjectExistance = validateProjectExistance;
const validateUserAccessOnProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { project } = req;
    const uid = req.query.uid;
    if (project.owner.toString() === uid) {
        req.type = 'owner';
        req.owner = true;
        return next();
    }
    try {
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, 'project._id': project._id, state: true });
        if (!collaborator) {
            req.type = 'guest';
            req.owner = false;
            req.levels = ['open'];
            return next();
        }
        const { levels } = (0, exports.whatIsTheAccess)(collaborator.project.accessLevel);
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
        const { project } = req;
        const { projectID } = req.params;
        const uid = req.query.uid;
        if (project.owner.toString() === uid) {
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
        if (!minAccess.includes(collaborator.project.accessLevel)) {
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
    const { projectID } = req.params;
    const project = req.project;
    const uid = req.user._id;
    if (project.owner.toString() === uid.toString()) {
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
        const { levels } = (0, exports.whatIsTheAccess)(collaborator.project.accessLevel);
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
        if (project.owner.toString() !== uid) {
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
            const noti = new notisSchema_1.default({
                type: 'project-invitation',
                title: 'Project Invitation',
                description: `You have been invited to collaborate on project`,
                recipient: collaborator.id,
                from: { name: req.user.username, ID: req.user._id, photoUrl: req.user.photoUrl || null },
                additionalData: {
                    project_name: project.name,
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
            const { layerID: { visibility } } = repo;
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
                    console.log('Creando nuevo colaborador en repo');
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
    console.log(req.body);
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
        const layers = projectLayers.length !== 0
            ? projectLayers
            : yield layerSchema_1.default.find({ project: projectID, 'visibility': { $exists: true } });
        const repos = projectRepos.length !== 0
            ? projectRepos
            : yield repoSchema_1.default.find({ projectID: projectID, 'visibility': { $exists: true } })
                .populate('layerID');
        // Actualizar los colaboradores en las capas y repositorios
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
        yield Promise.all(modifiedCollaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
            const { levels } = (0, exports.whatIsTheAccess)(collaborator.accessLevel);
            yield Promise.all(repos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
                const existingCollaborator = yield collaboratorSchema_1.default.findOne({ 'repository._id': repo._id, uid: collaborator.id })
                    .populate({
                    path: 'repository._id',
                    populate: { path: 'layerID' }
                });
                const { visibility: layerVisibility } = repo.layerID;
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
    const { projectID } = req.params;
    const { accessLevel } = req.body;
    const uid = req.user._id;
    const { type } = req;
    if (type === 'owner') {
        return next();
    }
    const { levels } = (0, exports.whatIsTheAccess)(accessLevel);
    try {
        const collaboratorOnLayers = yield collaboratorSchema_1.default.find({ uid, projectID, state: true, 'layer._id': { $exists: true } })
            .populate('layer._id');
        const collaboratorOnRepos = yield collaboratorSchema_1.default.find({ uid, projectID, state: true, 'repository._id': { $exists: true } })
            .populate('repository._id');
        const layersBaseOnLevel = collaboratorOnLayers.map(colab => {
            if (levels.includes(colab.layer.visibility)) {
                return colab;
            }
        }).filter(colab => colab !== undefined);
        const reposBaseOnLevel = collaboratorOnRepos.map(colab => {
            if (levels.includes(colab.repository.visibility)) {
                return colab;
            }
        }).filter(colab => colab !== undefined);
        return res.json({
            layers: layersBaseOnLevel,
            repos: reposBaseOnLevel
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
exports.returnDataBaseOnAccessLevel = returnDataBaseOnAccessLevel;
//# sourceMappingURL=project-middlewares.js.map