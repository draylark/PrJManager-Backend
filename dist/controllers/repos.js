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
exports.getTopUserRepos = exports.getReposByLayer = exports.getReposByProject = exports.getRepositoriesByUserId = exports.getRepoCollaborators = exports.updateRepos = exports.deleteRepository = exports.updateRepository = exports.getRepositoryById = exports.getRepositories = exports.createRepository = void 0;
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const commitSchema_1 = __importDefault(require("../models/commitSchema"));
const helpers_middlewares_1 = require("../middlewares/others/helpers-middlewares");
const createRepository = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('llegue hasta createRepository');
    try {
        res.status(200).json({
            success: true,
            message: 'Repository created successfully'
        });
    }
    catch (error) {
        console.log('aqui la request fallo');
        res.status(400).json({ message: error.message });
    }
});
exports.createRepository = createRepository;
// READ
const getRepositories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        message: 'Hola'
    });
    // try {
    //     const repositories = await Repo.find();
    //     res.status(200).json(repositories);
    // } catch (error) {
    //     res.status(500).json({ message: error.message });
    // }
});
exports.getRepositories = getRepositories;
const getRepositoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repository = yield repoSchema_1.default.findById(req.params.id);
        if (repository) {
            res.status(200).json({
                repo: repository
            });
        }
        else {
            res.status(404).json({ message: 'Repository not found' });
        }
    }
    catch (error) {
        // console.log()
        res.status(500).json({ message: error.message });
    }
});
exports.getRepositoryById = getRepositoryById;
// UPDATE
const updateRepository = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const { creatingMiddlewareState, updatingMiddlewareState, deletingMiddlewareState } = req;
    const _a = req.body, { collaborators, modifiedCollaborators, deletedCollaborators, newCollaborators, newDefaultBranch } = _a, rest = __rest(_a, ["collaborators", "modifiedCollaborators", "deletedCollaborators", "newCollaborators", "newDefaultBranch"]);
    const message = `${creatingMiddlewareState || updatingMiddlewareState || deletingMiddlewareState ?
        `Collaborators and repository updated successfully. ${newDefaultBranch ? 'Default branch changed.' : ''}` :
        'Repository updated successfully'} ${newDefaultBranch ? ' and default branch changed.' : ''}   
    `;
    try {
        if (newDefaultBranch !== null) {
            const repository = yield repoSchema_1.default.findByIdAndUpdate(repoID, Object.assign(Object.assign({}, rest), { defaultBranch: newDefaultBranch }), { new: true });
            res.status(200).json({
                success: true,
                message,
                repository
            });
        }
        else {
            const repository = yield repoSchema_1.default.findByIdAndUpdate(repoID, rest, { new: true });
            res.status(200).json({
                success: true,
                message,
                repository
            });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.updateRepository = updateRepository;
// DELETE
const deleteRepository = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repository = yield repoSchema_1.default.findByIdAndDelete(req.params.id);
        if (repository) {
            res.status(200).json(repository);
        }
        else {
            res.status(404).json({ message: 'Repository not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRepository = deleteRepository;
const updateRepos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { modifiedRepos } = req.body;
    if (!modifiedRepos || modifiedRepos.length === 0) {
        return res.status(200).json({
            msg: 'No hay repositorios modificados'
        });
    }
    try {
        if (modifiedRepos.length > 0) {
            yield Promise.all(modifiedRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
                if (repo.collaborators && repo.collaborators.length > 0) {
                    yield Promise.all(repo.collaborators.map((collaborator) => __awaiter(void 0, void 0, void 0, function* () {
                        const existingCollaborator = yield collaboratorSchema_1.default.findOne({
                            repository: repo.repoId,
                            user: collaborator.id
                        });
                        if (existingCollaborator) {
                            yield collaboratorSchema_1.default.findByIdAndUpdate(existingCollaborator._id, {
                                accessLevel: collaborator.accessLevel
                            });
                        }
                        else {
                            const newRepoCollaborator = new collaboratorSchema_1.default({
                                repository: repo.repoId,
                                user: collaborator.id,
                                accessLevel: collaborator.accessLevel
                            });
                            yield newRepoCollaborator.save();
                        }
                    })));
                }
            })));
        }
        res.status(200).json({ msg: 'Repositorios actualizados correctamente' });
    }
    catch (error) {
        res.status(500).json({ msg: 'Error al actualizar los repositorios', error });
    }
});
exports.updateRepos = updateRepos;
const getRepoCollaborators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoId } = req.params;
    const { add } = req.query;
    const searchQuery = req.query.searchQuery;
    const minAccess = ['editor', 'manager', 'administrator'];
    try {
        if (add) {
            const collaborators = yield collaboratorSchema_1.default.find({
                name: new RegExp(searchQuery, 'i'),
                'repository._id': repoId,
                'repository.accessLevel': { $in: minAccess },
                state: true
            }).select('uid name photoUrl');
            console.log('collaborators', collaborators);
            res.status(200).json({
                collaborators
            });
        }
        else {
            const collaborators = yield collaboratorSchema_1.default.find({ 'repository._id': repoId, state: true });
            res.status(200).json({
                collaborators
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getRepoCollaborators = getRepoCollaborators;
const getRepositoriesByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const repository = yield repoSchema_1.default.find({ owner: userId });
        if (repository) {
            res.status(200).json(repository);
        }
        else {
            res.status(404).json({ message: 'No repositories yet' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getRepositoriesByUserId = getRepositoriesByUserId;
const getReposByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { owner, repos } = req;
    try {
        if (owner && owner === true) {
            const repos = yield repoSchema_1.default.find({ projectID: projectID });
            res.status(200).json({
                success: true,
                repos
            });
        }
        else {
            res.status(200).json({
                success: true,
                repos
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getReposByProject = getReposByProject;
const getReposByLayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    const { owner, repos } = req;
    console.log('repos', repos);
    try {
        if (owner && owner === true) {
            const repos = yield repoSchema_1.default.find({ layerID });
            res.status(200).json({
                success: true,
                repos
            });
        }
        else {
            console.log('Entrando a collaborator');
            res.status(200).json({
                success: true,
                repos
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getReposByLayer = getReposByLayer;
const getTopUserRepos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        // Obtener repositorios del usuario con visibilidad abierta
        const repos = yield repoSchema_1.default.find({ creator: uid, visibility: 'open' })
            .select('visibility name _id description layerID projectID')
            .populate('layerID', 'visibility _id name')
            .populate('projectID', 'visibility _id name')
            .lean();
        // Filtrar repositorios por visibilidad
        const filteredRepos = repos.filter(repo => (0, helpers_middlewares_1.validateVisibility)(repo.projectID.visibility, repo.layerID.visibility, repo.visibility));
        const filteredRepoIds = filteredRepos.map(repo => repo._id);
        // Obtener todos los commits de los repositorios filtrados
        const commits = yield commitSchema_1.default.find({ 'author.uid': uid, repository: { $in: filteredRepoIds } });
        // Contar la cantidad de commits por repositorio
        const commitCounts = commits.reduce((acc, commit) => {
            const repoKey = commit.repository.toString();
            acc[repoKey] = (acc[repoKey] || 0) + 1;
            return acc;
        }, {});
        // Añadir la cantidad de commits a los repositorios
        const reposWithCommitCounts = filteredRepos.map(repo => (Object.assign(Object.assign({}, repo), { commitCount: commitCounts[repo._id.toString()] || 0 })));
        // Ordenar repositorios por cantidad de commits en orden descendente
        const sortedRepos = reposWithCommitCounts.sort((a, b) => b.commitCount - a.commitCount);
        // Seleccionar los tres primeros repositorios
        const topRepos = sortedRepos.slice(0, 3);
        res.status(200).json({
            success: true,
            topRepos
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getTopUserRepos = getTopUserRepos;
//# sourceMappingURL=repos.js.map