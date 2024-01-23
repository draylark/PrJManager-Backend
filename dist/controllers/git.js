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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = exports.pull = exports.push = void 0;
const nodegit = __importStar(require("nodegit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const push = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   const { localPath, commitMessage, remoteUrl, branchName } = req.body;
    const { projectId, remoteRepo } = req.params;
    const repoDir = path_1.default.join(__dirname, '..', '..', `repos/${projectId}`, `${remoteRepo}.git`);
    if (!fs_1.default.existsSync(repoDir))
        return res.status(400).json({
            msg: 'Repository does not exists'
        });
    try {
        const repo = yield nodegit.Repository.open(repoDir);
        const remote = yield repo.getRemote('origin');
        const refSpecs = [`refs/heads/master:refs/heads/${remoteRepo}`];
        const signature = nodegit.Signature.now('Juan', 'juan@example.com');
        const commitId = yield repo.createCommitOnHead([], signature, signature, 'Initial commit');
        const commit = yield repo.getCommit(commitId);
        yield remote.push(refSpecs, {
            callbacks: {
                credentials: () => {
                    return nodegit.Cred.userpassPlaintextNew('Juan', '123456');
                },
                certificateCheck: () => {
                    return 1; // Ignora la verificación del certificado SSL
                },
            },
        });
        res.status(200).json({ message: 'Repository pushed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.push = push;
const pull = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Lógica para pull de cambios de un repositorio de Git
});
exports.pull = pull;
const clone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { remoteUrl, localPath, username, password } = req.body;
    try {
        const cloneOptions = new nodegit.CloneOptions();
        cloneOptions.fetchOpts = {
            callbacks: {
                credentials: () => {
                    return nodegit.Cred.userpassPlaintextNew(username, password);
                },
                certificateCheck: () => {
                    return 1; // Ignora la verificación del certificado SSL
                },
            },
        };
        yield nodegit.Clone(remoteUrl, localPath, cloneOptions);
        res.status(200).json({ message: 'Repository cloned successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.clone = clone;
//# sourceMappingURL=git.js.map