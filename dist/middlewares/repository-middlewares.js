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
exports.geProjectCreatedReposDates = exports.getCreatedReposDates = exports.getLayerReposDataBaseOnAccess = exports.getProjectReposDataBaseOnAccess = exports.deleteCollaborators = exports.newCollaborators = exports.updateRepoCollaborators = exports.verifyLayerRepos = exports.verifyTwoAccessLevelOfCollaborator = exports.verifyProjectLevelAccessOfNewCollaborator = exports.verifyLayerAccessLevelOfNewCollaborator = exports.validateCollaboratorAccessOnRepository = exports.validateRepositoryExistance = exports.createRepoOnMongoDB = exports.createRepoOnGitlab = void 0;
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
const axios_1 = __importDefault(require("axios"));
const layerSchema_1 = __importDefault(require("../models/layerSchema"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const createRepoOnGitlab = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layer } = req;
    try {
        const permanentVsibility = 'private';
        const accessToken = process.env.GITLAB_ACCESS_TOKEN;
        // Generar un nombre de repositorio único
        const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const repoName = `repo-${uniqueSuffix}`;
        // Crear el repositorio en GitLab
        const response = yield axios_1.default.post(`https://gitlab.com/api/v4/projects`, {
            name: repoName,
            visibility: permanentVsibility,
            namespace_id: layer === null || layer === void 0 ? void 0 : layer.gitlabId, // ID del grupo donde se creará el repositorio
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        console.log('Repositorio creado en Gitlab', response.data);
        req.gitlabRepo = response.data;
        next();
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.createRepoOnGitlab = createRepoOnGitlab;
const createRepoOnMongoDB = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID, layerID } = req.params;
    const { name, visibility, description, uid } = req.body;
    const { gitlabRepo } = req;
    try {
        const newRepo = new repoSchema_1.default({
            name,
            description: description,
            visibility,
            gitUrl: gitlabRepo === null || gitlabRepo === void 0 ? void 0 : gitlabRepo.http_url_to_repo,
            webUrl: gitlabRepo === null || gitlabRepo === void 0 ? void 0 : gitlabRepo.web_url,
            projectID,
            layerID,
            gitlabId: gitlabRepo === null || gitlabRepo === void 0 ? void 0 : gitlabRepo.id,
            creator: uid,
            defaultBranch: gitlabRepo === null || gitlabRepo === void 0 ? void 0 : gitlabRepo.default_branch
        });
        yield newRepo.save();
        yield projectSchema_1.default.findByIdAndUpdate(projectID, { $inc: { repositories: 1 } }, { new: true });
        yield layerSchema_1.default.findByIdAndUpdate(layerID, { $inc: { repositories: 1 } }, { new: true });
        console.log('Repositorio creado en MongoDB', newRepo);
        req.success = true;
        req.repoID = newRepo._id;
        next();
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.createRepoOnMongoDB = createRepoOnMongoDB;
// ! Validation
const validateRepositoryExistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    try {
        const repo = yield repoSchema_1.default.findById(repoID);
        if (!repo)
            return res.status(404).json({
                message: 'Repository not found'
            });
        req.repo = repo;
        next();
    }
    catch (error) {
        console.log(error);
        console.log('error3');
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
    ;
});
exports.validateRepositoryExistance = validateRepositoryExistance;
const validateCollaboratorAccessOnRepository = (minAccess) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { project } = req;
        const { repoID } = req.params;
        const uid = req.query.uid;
        if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
            return next();
        }
        const collaborator = yield collaboratorSchema_1.default.findOne({ uid, 'repository._id': repoID });
        if (!collaborator) {
            return res.status(400).json({
                message: 'You do not have access to this repository'
            });
        }
        if (!minAccess.includes((_b = (_a = collaborator === null || collaborator === void 0 ? void 0 : collaborator.repository) === null || _a === void 0 ? void 0 : _a.accessLevel) !== null && _b !== void 0 ? _b : 'no-access')) {
            return res.status(400).json({
                message: 'You do not have the required access level to perform this action'
            });
        }
        next();
    });
};
exports.validateCollaboratorAccessOnRepository = validateCollaboratorAccessOnRepository;
const verifyLayerAccessLevelOfNewCollaborator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID, layerID } = req.params;
    const { newCollaborators } = req.body;
    if (newCollaborators.length === 0) {
        return next();
    }
    ;
    for (const collaborator of newCollaborators) {
        const { id, photoUrl, name } = collaborator;
        // Comprobar y actualizar o insertar para la capa
        const layerCollaborator = yield collaboratorSchema_1.default.findOne({ uid: id, projectID, 'layer._id': layerID });
        if (layerCollaborator && layerCollaborator.layer) {
            if (!layerCollaborator.state) {
                if (layerCollaborator.layer.accessLevel !== undefined) { // Asegurar que accessLevel no es undefined antes de asignar un nuevo valor
                    layerCollaborator.layer.accessLevel = 'contributor'; // Actualizar el nivel de acceso a colaborador
                }
                layerCollaborator.state = true; // Actualizar el estado a true
                yield layerCollaborator.save(); // Guardar el documento actualizado
            }
        }
        else {
            // Crear nuevo documento para la capa si no existe
            yield collaboratorSchema_1.default.create({
                projectID,
                uid: id,
                name,
                photoUrl,
                layer: { _id: layerID, accessLevel: 'contributor' },
                state: true
            });
        }
    }
    ;
    next();
});
exports.verifyLayerAccessLevelOfNewCollaborator = verifyLayerAccessLevelOfNewCollaborator;
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
                message: 'The collaborator(s) has not been found at the project level, to add a collaborator at the repository level, this must be a collaborator at the project level first.'
            });
        }
    }
    next();
});
exports.verifyProjectLevelAccessOfNewCollaborator = verifyProjectLevelAccessOfNewCollaborator;
const verifyTwoAccessLevelOfCollaborator = (minAccess) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { projectID, layerID } = req.params;
        const { uid } = req.query;
        const { project } = req;
        if ((project === null || project === void 0 ? void 0 : project.owner.toString()) === uid) {
            return next();
        }
        const cOnProject = yield collaboratorSchema_1.default.findOne({ projectID, uid, state: true, 'project._id': projectID }).lean();
        if (cOnProject && minAccess.includes((_b = (_a = cOnProject === null || cOnProject === void 0 ? void 0 : cOnProject.project) === null || _a === void 0 ? void 0 : _a.accessLevel) !== null && _b !== void 0 ? _b : 'no-access')) {
            return next();
        }
        const cOnLayer = yield collaboratorSchema_1.default.findOne({ projectID, uid, state: true, 'layer._id': layerID }).lean();
        if (cOnLayer && minAccess.includes((_d = (_c = cOnLayer === null || cOnLayer === void 0 ? void 0 : cOnLayer.layer) === null || _c === void 0 ? void 0 : _c.accessLevel) !== null && _d !== void 0 ? _d : 'no-access')) {
            return next();
        }
        return res.status(400).json({
            success: false,
            message: 'You do not have the required access level to perform this action',
            type: 'collaborator-validation'
        });
    });
};
exports.verifyTwoAccessLevelOfCollaborator = verifyTwoAccessLevelOfCollaborator;
const verifyLayerRepos = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layer } = req;
    try {
        if (layer && layer.repositories && layer.repositories >= 3) {
            return res.status(400).json({
                success: false,
                message: 'The layer has reached the maximum number of repositories',
                type: 'repos-limit'
            });
        }
        next();
    }
    catch (error) {
        console.log('error', error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.verifyLayerRepos = verifyLayerRepos;
// ! Updating
const updateRepoCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const { modifiedCollaborators } = req.body;
    if (modifiedCollaborators.length === 0) {
        req.updatingMiddlewareState = false;
        return next();
    }
    try {
        yield Promise.all(modifiedCollaborators.map((colab) => {
            const { id, accessLevel } = colab;
            return collaboratorSchema_1.default.findOneAndUpdate({ uid: id, 'repository._id': repoID }, { 'repository.accessLevel': accessLevel });
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
exports.updateRepoCollaborators = updateRepoCollaborators;
// ! Creation / Updating
const newCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID, projectID } = req.params;
    const { newCollaborators } = req.body;
    const { repo, layer, project } = req;
    if (newCollaborators.length === 0) {
        req.creatingMiddlewareState = false;
        return next();
    }
    let totalCreated = 0;
    try {
        const processCollaborator = (collaborator) => __awaiter(void 0, void 0, void 0, function* () {
            const { id, name, photoUrl, accessLevel } = collaborator;
            let existingCollaborator = yield collaboratorSchema_1.default.findOne({ uid: id, 'repository._id': repoID });
            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    yield collaboratorSchema_1.default.updateOne({ projectID, _id: existingCollaborator._id, 'repository._id': repoID }, { $set: { state: true, name: name, photoUrl: photoUrl, 'repository.accessLevel': accessLevel } });
                    const noti = new notisSchema_1.default({
                        type: 'added-to-repo',
                        title: 'Added to repository',
                        description: `You have been added to a repository.`,
                        recipient: id,
                        from: { name: 'System', ID: projectID },
                        additionalData: { repoId: repoID, repoName: repo === null || repo === void 0 ? void 0 : repo.name, accessLevel, projectName: project === null || project === void 0 ? void 0 : project.name, layerName: layer === null || layer === void 0 ? void 0 : layer.name, layerId: layer === null || layer === void 0 ? void 0 : layer._id }
                    });
                    yield noti.save();
                    totalCreated++;
                }
                // Si el colaborador existe y ya está activo, no aumentar totalCreated.
            }
            else {
                const c = new collaboratorSchema_1.default({ projectID, uid: id, name, photoUrl, repository: { _id: repoID, accessLevel }, state: true });
                yield c.save();
                const noti = new notisSchema_1.default({
                    type: 'added-to-repo',
                    title: 'Added to repository',
                    description: `You have been added to a repository.`,
                    recipient: id,
                    from: { name: 'System', ID: projectID },
                    additionalData: { repoId: repoID, repoName: repo === null || repo === void 0 ? void 0 : repo.name, accessLevel, projectName: project === null || project === void 0 ? void 0 : project.name, layerName: layer === null || layer === void 0 ? void 0 : layer.name, layerId: layer === null || layer === void 0 ? void 0 : layer._id }
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
        console.log(error);
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
    ;
});
exports.newCollaborators = newCollaborators;
// ! Deletion
const deleteCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const { deletedCollaborators } = req.body;
    if (deletedCollaborators.length === 0) {
        req.deletingMiddlewareState = false;
        return next();
    }
    try {
        const results = yield Promise.all(deletedCollaborators.map(id => {
            return collaboratorSchema_1.default.updateMany({ uid: id, 'repository._id': repoID }, { $set: { state: false } });
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
// ! Collaborator Propper Data Return based on access level
const getProjectReposDataBaseOnAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectID } = req.params;
    const uid = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { owner, levels, type } = req;
    if (owner && owner === true) {
        return next();
    }
    try {
        if (type === 'collaborator') {
            const collaboratorOnRepos = yield collaboratorSchema_1.default.find({ projectID, uid, state: true, 'repository._id': { $exists: true } })
                .lean()
                .populate({
                path: 'repository._id',
                populate: { path: 'layerID' } // Población en cadena de `layerID` dentro del documento del repositorio.
            });
            const reposBaseOnLevel = collaboratorOnRepos.map((collaborator) => {
                const _a = collaborator.repository, _b = _a._id, { visibility, gitlabId, gitUrl, webUrl, layerID } = _b, rest = __rest(_b, ["visibility", "gitlabId", "gitUrl", "webUrl", "layerID"]), { accessLevel } = _a;
                return Object.assign(Object.assign({}, rest), { visibility, layerID: layerID._id, accessLevel });
            });
            const openRepos = yield repoSchema_1.default.find({ projectID, visibility: 'open' })
                .populate('layerID')
                .lean();
            const uniqueOpenReposWithGuestAccess = openRepos
                .filter((openRepo) => !reposBaseOnLevel.some(repo => repo._id.toString() === openRepo._id.toString()))
                .map((repo) => {
                const { layerID: { _id, visibility }, gitUrl, webUrl, gitlabId } = repo, rest = __rest(repo, ["layerID", "gitUrl", "webUrl", "gitlabId"]);
                if (visibility === 'open') {
                    return Object.assign(Object.assign({}, rest), { layerID: _id, accessLevel: 'guest' });
                }
                return undefined; // Aquí, si no es open, retornamos undefined. Lo manejaremos después.
            })
                .filter((repo) => repo !== undefined);
            req.repos = [...reposBaseOnLevel, ...uniqueOpenReposWithGuestAccess];
            return next();
        }
        else {
            const repos = yield repoSchema_1.default.find({ projectID, visibility: { $in: levels } })
                .lean()
                .populate('layerID');
            const reposBaseOnLevel = repos.reduce((acc, repo) => {
                const { visibility, layerID, gitlabId, gitUrl, webUrl } = repo, rest = __rest(repo, ["visibility", "layerID", "gitlabId", "gitUrl", "webUrl"]);
                if (visibility && levels && levels.includes(visibility) && levels.includes(layerID.visibility)) {
                    acc.push(Object.assign(Object.assign({}, rest), { visibility, layerID: layerID._id, accessLevel: 'guest' }));
                }
                return acc;
            }, []);
            req.repos = reposBaseOnLevel;
            return next();
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
exports.getProjectReposDataBaseOnAccess = getProjectReposDataBaseOnAccess;
const getLayerReposDataBaseOnAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.query.uid;
    const { projectID } = req.params;
    const { owner, levels, type } = req;
    if (owner && owner === true) {
        return next();
    }
    try {
        if (type === 'collaborator') {
            const collaboratorOnRepos = yield collaboratorSchema_1.default.find({ projectID, uid, state: true, 'repository._id': { $exists: true } })
                .lean()
                .populate({
                path: 'repository._id',
                populate: { path: 'layerID' } // Población en cadena de `layerID` dentro del documento del repositorio.
            });
            const reposBaseOnLevel = collaboratorOnRepos.map((collaborator) => {
                const _a = collaborator.repository, _b = _a._id, { visibility, gitlabId, gitUrl, webUrl, layerID } = _b, rest = __rest(_b, ["visibility", "gitlabId", "gitUrl", "webUrl", "layerID"]), { accessLevel } = _a;
                return Object.assign(Object.assign({}, rest), { visibility, layerID: layerID._id, accessLevel });
            });
            const openRepos = yield repoSchema_1.default.find({ projectID, visibility: 'open' })
                .populate('layerID')
                .lean();
            const uniqueOpenReposWithGuestAccess = openRepos.filter((openRepo) => !reposBaseOnLevel.some(repo => repo._id.toString() === openRepo._id.toString())).map(repo => {
                const { layerID: { _id, visibility }, gitUrl, webUrl, gitlabId } = repo, rest = __rest(repo, ["layerID", "gitUrl", "webUrl", "gitlabId"]);
                if (visibility === 'open') {
                    return Object.assign(Object.assign({}, rest), { layerID: _id, accessLevel: 'guest' });
                }
            }).filter((repo) => repo !== undefined);
            req.repos = [...reposBaseOnLevel, ...uniqueOpenReposWithGuestAccess];
            return next();
        }
        else {
            const repos = yield repoSchema_1.default.find({ projectID, visibility: { $in: levels } })
                .lean()
                .populate('layerID');
            const reposBaseOnLevel = repos.reduce((acc, repo) => {
                const { visibility, layerID, gitlabId, gitUrl, webUrl } = repo, rest = __rest(repo, ["visibility", "layerID", "gitlabId", "gitUrl", "webUrl"]);
                if (visibility && levels && levels.includes(visibility) && levels.includes(layerID.visibility)) {
                    acc.push(Object.assign(Object.assign({}, rest), { visibility, layerID: layerID._id, accessLevel: 'guest' }));
                }
                return acc;
            }, []);
            req.repos = reposBaseOnLevel;
            return next();
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
exports.getLayerReposDataBaseOnAccess = getLayerReposDataBaseOnAccess;
// ! Others
const getCreatedReposDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    try {
        const repos = yield repoSchema_1.default.find({ creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
            .select('_id name createdAt creator layerID projectID')
            .populate('layerID', 'name')
            .populate('projectID', 'name')
            .lean();
        req.createdRepos = repos;
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
exports.getCreatedReposDates = getCreatedReposDates;
const geProjectCreatedReposDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { startDate, endDate, uid } = req.query;
    try {
        const repos = yield repoSchema_1.default.find({ projectID: projectId, creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
            .select('_id name createdAt creator layerID projectID')
            .populate('layerID', 'name')
            .populate('projectID', 'name')
            .lean();
        req.createdRepos = repos;
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
exports.geProjectCreatedReposDates = geProjectCreatedReposDates;
//# sourceMappingURL=repository-middlewares.js.map