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
exports.getProfileCommits = exports.getCommitsForDashboard = exports.getRepoCommits = exports.getProyectCommits = exports.getCommitDiff = exports.getCommitsByRepo = void 0;
const commitSchema_1 = __importDefault(require("../models/commitSchema"));
const getCommitsByRepo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const commits = yield commitSchema_1.default.find({ repository: repoID })
        .populate({
        path: 'associated_task',
        select: '_id task_name'
    })
        .select('-hash')
        .sort({ createdAt: -1 }); // Orden descendente por fecha de creación
    res.json({
        commits
    });
});
exports.getCommitsByRepo = getCommitsByRepo;
const getCommitDiff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoGitlabID = req.repoGitlabID;
    const commit = req.commit;
    const diffUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoGitlabID)}/repository/commits/${commit === null || commit === void 0 ? void 0 : commit.hash}/diff`;
    const branchesUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoGitlabID)}/repository/branches`;
    try {
        // Realiza ambas llamadas API simultáneamente
        const [diffResponse, branchesResponse] = yield Promise.all([
            fetch(diffUrl, {
                headers: { 'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}` },
            }),
            fetch(branchesUrl, {
                headers: { 'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}` },
            })
        ]);
        // Verifica si alguna de las respuestas de la API no fue exitosa
        if (!diffResponse.ok) {
            return res.status(diffResponse.status).json({ message: `Error from GitLab API on diffs: ${diffResponse.statusText}` });
        }
        if (!branchesResponse.ok) {
            return res.status(branchesResponse.status).json({ message: `Error fetching branches: ${branchesResponse.statusText}` });
        }
        const diffData = yield diffResponse.json();
        const branches = yield branchesResponse.json();
        const branchesWithCommit = branches.filter(branch => branch.commit && branch.commit.id === (commit === null || commit === void 0 ? void 0 : commit.hash));
        // Envía los resultados en la respuesta
        res.json({
            diff: diffData,
            branches: branchesWithCommit.map(branch => branch.name) // Devuelve solo los nombres de las ramas que contienen el commit
        });
    }
    catch (error) {
        console.error('Error fetching commit diffs or branches:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.getCommitDiff = getCommitDiff;
const getProyectCommits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { owner, commits } = req;
    const queryYear = req.query.year;
    const year = parseInt(queryYear, 10); // Asegúrate de convertir el año a número
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
                .populate({
                path: 'associated_task',
                select: '_id task_name'
            })
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
const getRepoCommits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    const queryYear = req.query.year;
    const year = parseInt(queryYear, 10); // Asegúrate de convertir el año a número
    try {
        let matchConditions = { repository: repoID };
        if (year) {
            matchConditions = Object.assign(Object.assign({}, matchConditions), { createdAt: {
                    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                } });
        }
        const commits = yield commitSchema_1.default.find(matchConditions)
            .populate({
            path: 'associated_task',
            select: '_id task_name'
        })
            .select('-hash')
            .sort({ createdAt: -1 });
        return res.json({
            commits
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getRepoCommits = getRepoCommits;
const getCommitsForDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const uid = req.params.uid;
    try {
        let matchConditions = { 'author.uid': uid };
        if (startDate && endDate) {
            matchConditions['createdAt'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const commits = yield commitSchema_1.default.find(matchConditions)
            .select('_id message createdAt')
            .sort({ createdAt: -1 });
        return res.json({
            commits
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getCommitsForDashboard = getCommitsForDashboard;
const getProfileCommits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commits } = req;
    try {
        return res.json({
            commits
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getProfileCommits = getProfileCommits;
//# sourceMappingURL=commits.js.map