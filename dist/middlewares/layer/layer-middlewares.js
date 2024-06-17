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
exports.getProjectCreatedLayersDates = exports.getCreatedLayersDates = exports.getProjectLayersDataBaseOnAccess = exports.updateOtherCDataOfDeletedLayerCollaborators = exports.deleteCollaborators = exports.updateOtherCDataOfLayerModifiedCollaborators = exports.updateLayerCollaborators = exports.createOtherCDataOfLayerCreatedCollaborators = exports.newCollaborators = exports.verifyProjectLayers = exports.verifyProjectLevelAccessOfNewCollaborator = exports.validateCollaboratorAccessOnLayer = exports.validateLayerExistance = void 0;
const collaboratorSchema_1 = __importDefault(require("../../models/collaboratorSchema"));
const layerSchema_1 = __importDefault(require("../../models/layerSchema"));
const repoSchema_1 = __importDefault(require("../../models/repoSchema"));
const notisSchema_1 = __importDefault(require("../../models/notisSchema"));
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
// ! Validations
const validateLayerExistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    try {
        const layer = yield layerSchema_1.default.findById(layerID);
        if (!layer)
            return res.status(404).json({
                message: 'Layer not found'
            });
        req.layer = layer;
        next();
    }
    catch (error) {
        console.log('error2');
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
    ;
});
exports.validateLayerExistance = validateLayerExistance;
const validateCollaboratorAccessOnLayer = (minAccess) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { project } = req;
        const { layerID } = req.params;
        const uid = req.query.uid;
        if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
            return next();
        }
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, 'layer._id': layerID });
        if (!collaborator) {
            return res.status(400).json({
                success: false,
                message: 'You do not have access to this Layer'
            });
        }
        if (!minAccess.includes((_b = (_a = collaborator === null || collaborator === void 0 ? void 0 : collaborator.project) === null || _a === void 0 ? void 0 : _a.accessLevel) !== null && _b !== void 0 ? _b : 'no-access')) {
            return res.status(400).json({
                message: 'You do not have the required access level to perform this action'
            });
        }
        next();
    });
};
exports.validateCollaboratorAccessOnLayer = validateCollaboratorAccessOnLayer;
// export const verifyOneLevelAccessOfNewCollaborator = async( req: Request, res: Response, next: NextFunction ) => {
//     const { project } = req;
//     const { newCollaborators } = req.body;
//     const { projectID } = req.params
//     if( newCollaborators.length === 0 ) {
//         return next();
//     }
//     try {
//         await Promise.all(newCollaborators.map( async (collaborator) => {
//             const { id, photoUrl, name } = collaborator;
//             const prjCollaborator = await Collaborator.findOne({ uid: id, 'project._id': project._id });
//             if (!prjCollaborator) {
//                 const c = new Collaborator({ uid: id, name, photoUrl, projectID, project: { _id: project._id, accessLevel: 'contributor' } });
//                 await c.save();
//             }
//         }));
//         next();
//     } catch (error) {
//         console.log('error AASDASDASDGSC', error)
//         res.status(400).json({
//             message: 'Internal Server error',
//             error
//         });
//     }
// };
const verifyProjectLevelAccessOfNewCollaborator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID, layerID } = req.params;
    const { newCollaborators } = req.body;
    if (newCollaborators.length === 0) {
        return next();
    }
    for (const collaborator of newCollaborators) {
        const { id } = collaborator;
        // Comprobar y actualizar o insertar para el proyecto
        const prjCollaborator = yield collaboratorSchema_1.default.findOne({ uid: id, state: true, projectID, 'project._id': projectID });
        if (!prjCollaborator) {
            return res.status(400).json({
                success: false,
                message: 'The collaborator(s) has not been found at the project level, to add a collaborator at the layer level, this must be a collaborator at the project level first.'
            });
        }
    }
    next();
});
exports.verifyProjectLevelAccessOfNewCollaborator = verifyProjectLevelAccessOfNewCollaborator;
const verifyProjectLayers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { project } = req;
    try {
        if (project && (project === null || project === void 0 ? void 0 : project.layers) >= 3) {
            return res.status(400).json({
                success: false,
                message: 'The Project has reached the maximum number of layers',
                type: 'layers-limit'
            });
        }
        next();
    }
    catch (error) {
        console.log('error', error);
        res.status(400).json({
            message: 'Internal Server error',
            error,
            type: 'server-error'
        });
    }
});
exports.verifyProjectLayers = verifyProjectLayers;
// ! Creation / Updating
const newCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID, projectID } = req.params;
    const { newCollaborators } = req.body;
    const { layer, project } = req;
    if (newCollaborators.length === 0) {
        req.creatingMiddlewareState = false;
        return next();
    }
    let totalCreated = 0;
    try {
        const processCollaborator = (collaborator) => __awaiter(void 0, void 0, void 0, function* () {
            const { id, name, photoUrl, accessLevel } = collaborator;
            let existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid: id, 'layer._id': layerID, projectID });
            console.log('existingCollaborator', existingCollaborator);
            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    yield collaboratorSchema_1.default.updateOne({ _id: existingCollaborator._id, 'layer._id': layerID, projectID }, { $set: { state: true, name: name, photoUrl: photoUrl, 'layer.accessLevel': accessLevel } });
                    const noti = new notisSchema_1.default({
                        type: 'added-to-layer',
                        title: 'You have been added to a Layer',
                        recipient: id,
                        from: { name: 'System', ID: projectID },
                        additionalData: { layerId: layerID, layerName: layer === null || layer === void 0 ? void 0 : layer.name, projectName: project === null || project === void 0 ? void 0 : project.name, accessLevel }
                    });
                    yield noti.save();
                    totalCreated++;
                }
                // Si el colaborador existe y ya está activo, no aumentar totalCreated.
            }
            else {
                console.log('new collaborator');
                const c = new collaboratorSchema_1.default({ uid: id, name, photoUrl, projectID, layer: { _id: layerID, accessLevel }, state: true });
                yield c.save();
                const noti = new notisSchema_1.default({
                    type: 'added-to-layer',
                    title: 'You have been added to a Layer',
                    recipient: id,
                    from: { name: 'System', ID: projectID },
                    additionalData: { layerId: layerID, layerName: layer === null || layer === void 0 ? void 0 : layer.name, projectName: project === null || project === void 0 ? void 0 : project.name, accessLevel }
                });
                yield noti.save();
                totalCreated++;
            }
        });
        // Procesar cada colaborador con un intervalo entre ellos
        for (let i = 0; i < newCollaborators.length; i++) {
            yield processCollaborator(newCollaborators[i]);
            yield new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100 ms antes de procesar el siguiente colaborador
        }
        req.totalCreatedCollaborators = totalCreated;
        req.creatingMiddlewareState = true;
        next();
    }
    catch (error) {
        console.log('1', error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.newCollaborators = newCollaborators;
const createOtherCDataOfLayerCreatedCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID, layerID } = req.params;
    const { newCollaborators } = req.body;
    const { projectRepos = [] } = req;
    if (newCollaborators.length === 0) {
        return next();
    }
    try {
        const repos = projectRepos.length !== 0
            ? projectRepos
            : yield repoSchema_1.default.find({ projectID: projectID, layerID, 'visibility': { $exists: true } });
        yield Promise.all(newCollaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
            const { id, name, photoUrl, accessLevel } = collaborator;
            const { levels } = whatIsTheAccess(accessLevel);
            // Asumiendo que `Layer` y `Repo` son los modelos de las capas y repositorios, respectivamente
            yield Promise.all(repos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
                // Crear el colaborador en el repositorio si tiene acceso
                let existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid: id, projectID, 'repository._id': repo._id });
                console.log('existingCollaborator en repo de layer', existingCollaborator);
                if (existingCollaborator && !existingCollaborator.state) {
                    if (levels.includes(repo.visibility)) {
                        yield collaboratorSchema_1.default.updateOne({ uid: id, projectID, 'repository._id': repo._id }, { $set: { state: true, 'repository.accessLevel': appropiateLevelAccessOnRepo(accessLevel) } });
                    }
                }
                else {
                    if (levels.includes(repo.visibility)) {
                        const c = new collaboratorSchema_1.default({ uid: id, name, photoUrl, repository: { _id: repo._id, accessLevel: appropiateLevelAccessOnRepo(accessLevel) }, state: true, projectID });
                        yield c.save();
                    }
                }
                ;
            })));
        })));
        next();
    }
    catch (error) {
        console.log('2', error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.createOtherCDataOfLayerCreatedCollaborators = createOtherCDataOfLayerCreatedCollaborators;
// ! Updating
const updateLayerCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    const { modifiedCollaborators } = req.body;
    if (modifiedCollaborators.length === 0) {
        req.updatingMiddlewareState = false;
        return next();
    }
    try {
        yield Promise.all(modifiedCollaborators.map((colab) => {
            const { id, accessLevel } = colab;
            return collaboratorSchema_1.default.findOneAndUpdate({ uid: id, 'layer._id': layerID }, { 'layer.accessLevel': accessLevel });
        }));
        // Este código no se ejecuta hasta que todas las promesas en el arreglo hayan sido resueltas
        req.updatingMiddlewareState = true;
        next();
    }
    catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.updateLayerCollaborators = updateLayerCollaborators;
const updateOtherCDataOfLayerModifiedCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID, layerID } = req.params;
    const { modifiedCollaborators } = req.body;
    const { projectRepos = [] } = req;
    if (modifiedCollaborators.length === 0) {
        return next();
    }
    try {
        const repos = projectRepos.length !== 0
            ? projectRepos
            : yield repoSchema_1.default.find({ projectID, layerID, 'visibility': { $exists: true } });
        yield Promise.all(modifiedCollaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
            const { levels } = whatIsTheAccess(collaborator.accessLevel);
            // Asumiendo que `Layer` y `Repo` son los modelos de las capas y repositorios, respectivamente
            yield Promise.all(repos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
                const existingCollaborator = yield collaboratorSchema_1.default.findOne({ 'repository._id': repo._id, uid: collaborator.id });
                if (!levels.includes(repo.visibility)) {
                    if (existingCollaborator) {
                        // El colaborador ya no debería tener acceso, actualiza el estado a false
                        yield collaboratorSchema_1.default.updateOne({ _id: existingCollaborator._id }, { $set: { state: false } });
                    }
                    // No hacer nada si no existe porque el colaborador no debería tener acceso
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
                            state: true // Asumiendo que quieres que el estado sea true por defecto
                            // Añade otros campos requeridos según tu esquema de colaborador
                        });
                        yield newCollaborator.save();
                    }
                }
            })));
        })));
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
exports.updateOtherCDataOfLayerModifiedCollaborators = updateOtherCDataOfLayerModifiedCollaborators;
// ! Deletion
const deleteCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID, projectID } = req.params;
    const { deletedCollaborators } = req.body;
    if (deletedCollaborators.length === 0) {
        req.totalDeletedCollaborators = 0;
        req.deletingMiddlewareState = false;
        return next();
    }
    try {
        // Ejecutar todas las operaciones de actualización y capturar los resultados
        const results = yield Promise.all(deletedCollaborators.map(id => {
            return collaboratorSchema_1.default.updateMany({ uid: id, 'layer._id': layerID, projectID }, { $set: { state: false } });
        }));
        const totalModified = results.reduce((acc, result) => acc + result.modifiedCount, 0);
        // Almacenar el total de colaboradores eliminados en el objeto de solicitud para su uso posterior
        req.totalDeletedCollaborators = totalModified;
        req.deletingMiddlewareState = true;
        next();
    }
    catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.deleteCollaborators = deleteCollaborators;
const updateOtherCDataOfDeletedLayerCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID, layerID } = req.params;
    const { deletedCollaborators } = req.body;
    if (deletedCollaborators.length === 0) {
        req.projectRepos = [];
        return next();
    }
    try {
        yield Promise.all(deletedCollaborators.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            const collaborators = yield collaboratorSchema_1.default.find({ uid: id, projectID, 'repository._id': { $exists: true } })
                .lean()
                .populate({
                path: 'repository._id',
                populate: { path: 'layerID' }
            });
            yield Promise.all(collaborators.map((collaborator) => {
                var _a;
                if (!collaborator.repository) {
                    console.error('Error: repository is null for collaborator', collaborator);
                    return; // Skip this iteration if repository is null
                }
                const layer = (_a = collaborator === null || collaborator === void 0 ? void 0 : collaborator.repository._id) === null || _a === void 0 ? void 0 : _a.layerID;
                // const { _id: { layerID: layer, ...rest } } = collaborator.repository;
                if (layer._id && layer._id.toString() === layerID && collaborator.state === true) {
                    // Process your update logic here
                    return collaboratorSchema_1.default.updateOne({ uid: id, projectID, 'repository._id': collaborator.repository._id }, { $set: { state: false } });
                }
            }));
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
    ;
});
exports.updateOtherCDataOfDeletedLayerCollaborators = updateOtherCDataOfDeletedLayerCollaborators;
// ! Collaborator Propper Data Return based on access level
const getProjectLayersDataBaseOnAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.query.uid;
    const { projectID } = req.params;
    const { owner, levels, type } = req;
    if (owner && owner === true) {
        return next();
    }
    try {
        if (type === 'collaborator') {
            const collaboratorOnLayers = yield collaboratorSchema_1.default.find({ projectID, uid, state: true, 'layer._id': { $exists: true } })
                .populate('layer._id')
                .lean();
            // ! Layers on which the user is a collaborator
            const layersBaseOnLevel = collaboratorOnLayers.map((collaborator) => {
                if (!collaborator.layer || !collaborator.layer._id || typeof collaborator.layer._id === 'string')
                    return undefined;
                const { accessLevel } = collaborator.layer;
                if ('gitlabId' in collaborator.layer._id) {
                    const _a = collaborator.layer._id, { gitlabId } = _a, rest = __rest(_a, ["gitlabId"]);
                    return Object.assign(Object.assign({}, rest), { accessLevel }); // Aquí, rest debería contener el resto de las propiedades de Layer_i
                }
                return undefined; // O manejar de otra manera si el gitlabId no está presente
            }).filter((layer) => layer !== undefined); // Usamos un type guard en el filtro para asegurarnos de remover undefined
            // ! Layers with open visibility    
            const openLayers = yield layerSchema_1.default.find({ project: projectID, visibility: 'open' })
                .lean();
            const uniqueOpenLayersWithGuestAccess = openLayers.filter((openLayer) => openLayer._id && !layersBaseOnLevel.some(layer => layer._id && layer._id.toString() === openLayer._id.toString())).map(layer => {
                if (!layer._id)
                    return undefined; // Esto nunca debería pasar por el filtro, pero es una precaución adicional.
                const { gitlabId, __v } = layer, rest = __rest(layer, ["gitlabId", "__v"]);
                return Object.assign(Object.assign({}, rest), { accessLevel: 'guest' });
            }).filter((layer) => layer !== undefined);
            // ! Combine layers
            req.layers = [...layersBaseOnLevel, ...uniqueOpenLayersWithGuestAccess];
            return next();
        }
        else {
            const layers = yield layerSchema_1.default.find({ project: projectID, visibility: { $in: levels } })
                .lean();
            const layersWithGuestAccess = layers.map((layer) => {
                const { gitlabId, __v } = layer, rest = __rest(layer, ["gitlabId", "__v"]);
                return Object.assign(Object.assign({}, rest), { accessLevel: 'guest' });
            });
            req.layers = layersWithGuestAccess;
            return next();
        }
        ;
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getProjectLayersDataBaseOnAccess = getProjectLayersDataBaseOnAccess;
const getCreatedLayersDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    try {
        const layers = yield layerSchema_1.default.find({ creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
            .select('creator createdAt name _id project')
            .populate('project', 'name _id')
            .lean();
        req.createdLayers = layers;
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
exports.getCreatedLayersDates = getCreatedLayersDates;
const getProjectCreatedLayersDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { startDate, endDate, uid } = req.query;
    try {
        const layers = yield layerSchema_1.default.find({ project: projectId, creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
            .select('creator createdAt name _id project')
            .populate('project', 'name _id')
            .lean();
        req.createdLayers = layers;
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
exports.getProjectCreatedLayersDates = getProjectCreatedLayersDates;
//# sourceMappingURL=layer-middlewares.js.map