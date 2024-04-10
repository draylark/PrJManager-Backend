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
exports.getProyectCommits = exports.getCommitDiff = exports.getCommitsByRepo = void 0;
const commitSchema_1 = __importDefault(require("../models/commitSchema"));
const getCommitsByRepo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const commits = yield commitSchema_1.default.find({ repository: repoID })
        .select('-hash')
        .sort({ createdAt: -1 }); // Orden descendente por fecha de creación
    res.json({
        commits
    });
});
exports.getCommitsByRepo = getCommitsByRepo;
const getCommitDiff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoGitlabID, commit: { hash } } = req;
    const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoGitlabID)}/repository/commits/${hash}/diff`;
    try {
        const response = yield fetch(url, {
            headers: { 'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}` },
        });
        console.log(response);
        if (!response.ok) { // Verifica si la respuesta HTTP es exitosa (status en el rango 200-299)
            return res.status(response.status).json({ message: `Error from GitLab API: ${response.statusText}` });
        }
        const data = yield response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching commit diffs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.getCommitDiff = getCommitDiff;
const getProyectCommits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { owner, commits } = req;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    try {
        if (owner && owner === true) {
            let matchConditions = { project: projectID };
            if (year) {
                matchConditions = Object.assign(Object.assign({}, matchConditions), { createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    } });
            }
            const commits = yield commitSchema_1.default.find(matchConditions)
                .select('-hash')
                .sort({ createdAt: -1 });
            return res.json({
                commits
            });
        }
        else {
            return res.json({
                commits
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
exports.getProyectCommits = getProyectCommits;
//# sourceMappingURL=commits.js.map