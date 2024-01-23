"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullChanges = exports.pushChanges = exports.getFileContent = exports.getRepositoryFiles = void 0;
const nodegit = __importStar(require("nodegit"));
const getRepositoryFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoPath = "path/to/repo"; // Aquí va la ruta del repositorio local
    const directoryPath = "path/to/directory"; // Aquí va la ruta del directorio dentro del repositorio
    try {
        const repo = yield nodegit.Repository.open(repoPath);
        const index = yield repo.index();
        const files = index.entries().map(entry => entry.path);
        res.json({
            files
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
exports.getRepositoryFiles = getRepositoryFiles;
const getFileContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoPath = "path/to/repo"; // Aquí va la ruta del repositorio local
    const filePath = req.params.filePath; // Asume que la ruta del archivo se pasa como un parámetro en la URL
    try {
        const repo = yield nodegit.Repository.open(repoPath);
        const fileContent = yield repo.getBlob(filePath);
        res.json({
            content: fileContent.toString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
exports.getFileContent = getFileContent;
const pushChanges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoPath = "path/to/repo"; // Aquí va la ruta del repositorio local
    const message = req.body.message; // Asume que el mensaje del commit se pasa en el cuerpo de la solicitud
    try {
        const repo = yield nodegit.Repository.open(repoPath);
        const index = yield repo.refreshIndex();
        yield index.addAll();
        yield index.write();
        const oid = yield index.writeTree();
        const head = yield nodegit.Reference.nameToId(repo, "HEAD");
        const parent = yield repo.getCommit(head);
        const author = nodegit.Signature.now("Your Name", "your.email@example.com");
        const committer = nodegit.Signature.now("Your Name", "your.email@example.com");
        const commitId = yield repo.createCommit("HEAD", author, committer, message, oid, [parent]);
        const remote = yield repo.getRemote("origin");
        yield remote.push(["refs/heads/master:refs/heads/master"], {
            callbacks: {
                credentials: (url, userName) => {
                    return nodegit.Cred.sshKeyFromAgent(userName);
                },
            },
        });
        res.json({
            message: "Cambios subidos al repositorio remoto.",
            commitId
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
exports.pushChanges = pushChanges;
const pullChanges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoPath = "path/to/repo"; // Aquí va la ruta del repositorio local
    try {
        const repo = yield nodegit.Repository.open(repoPath);
        const remote = yield repo.getRemote("origin");
        yield remote.fetch(["refs/heads/master:refs/heads/master"], {
            callbacks: {
                credentials: (url, userName) => {
                    return nodegit.Cred.sshKeyFromAgent(userName);
                },
            },
        });
        yield repo.mergeBranches("master", "origin/master");
        res.json({
            message: "Cambios del repositorio remoto incorporados al repositorio local."
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
exports.pullChanges = pullChanges;
//# sourceMappingURL=reposGit.js.map