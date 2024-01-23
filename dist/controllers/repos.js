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
exports.getRepositoriesByUserId = exports.getRepoCollaborators = exports.updateRepos = exports.deleteRepository = exports.updateRepository = exports.getRepositoryById = exports.getRepositories = exports.createRepository = void 0;
const nodegit_1 = __importDefault(require("nodegit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const createRepository = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const _a = req.body, { project, name } = _a, rest = __rest(_a, ["project", "name"]);
        if (!project || !name) {
            throw new Error('Los campos project y name son requeridos');
        }
        const repoPath = path_1.default.join(__dirname, '..', '..', 'repos', project, `${name}.git`);
        if (fs_1.default.existsSync(repoPath)) {
            throw new Error('Ya existe un repositorio con ese nombre');
        }
        const repository = new repoSchema_1.default(Object.assign({ url: repoPath, project, name }, rest));
        yield repository.save();
        // Ejecutar el comando git init
        nodegit_1.default.Repository.init(repoPath, 1)
            .then((repo) => {
            console.log("Repositorio creado en: " + repo.workdir());
        })
            .catch((err) => {
            console.log(err);
        });
        res.status(201).json({
            repository,
            repoPath
        });
    }
    catch (error) {
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
exports.getRepositoryById = getRepositoryById;
// UPDATE
const updateRepository = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repository = yield repoSchema_1.default.findById(req.params.id);
        if (repository) {
            repository.set(req.body);
            yield repository.save();
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
    try {
        const collaborators = yield collaboratorSchema_1.default.find({ repository: repoId });
        res.status(200).json({
            collaborators
        });
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
        console.log('repositoryy', repository);
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
//# sourceMappingURL=repos.js.map