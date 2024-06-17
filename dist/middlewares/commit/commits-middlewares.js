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
exports.validateVisibility = exports.getProfileCommitsFiltered = exports.getProjectCommitsDates = exports.getCommitsDates = exports.getCommitsLength = exports.getProjectCommitsBaseOnAccess = exports.findCommit = exports.getCommits = exports.getCommitsHashes = exports.getContributorsCommits = void 0;
const commitSchema_1 = __importDefault(require("../../models/commitSchema"));
const collaboratorSchema_1 = __importDefault(require("../../models/collaboratorSchema"));
const evalAccess = (cOnLayer, cOnRepo, lVisibility, RVisibility) => {
    if (cOnLayer && cOnRepo && cOnLayer.state && !cOnRepo.state && RVisibility === 'open') {
        return true;
    }
    if (cOnLayer && cOnRepo && !cOnLayer.state && lVisibility === 'open' && !cOnRepo.state && RVisibility === 'open') {
        return true;
    }
    return false;
};
const getContributorsCommits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { hashes, contributorsData = [] } = req;
    try {
        const commits = yield commitSchema_1.default.find({ uuid: { $in: hashes } })
            .select('uuid createdAt author associated_task')
            .sort({ createdAt: -1 })
            .lean();
        const initializedContributors = contributorsData.reduce((acc, contributor) => {
            const idKey = contributor === null || contributor === void 0 ? void 0 : contributor._id.toString();
            acc[idKey] = {
                id: contributor._id,
                username: contributor.username,
                photoUrl: contributor.photoUrl || null,
                commits: 0,
                lastCommit: null,
                firstCommit: null
            };
            return acc;
        }, {});
        commits.forEach((commit) => {
            var _a;
            //! const idKey = commit?.author?._id.toString();
            const idKey = (_a = commit === null || commit === void 0 ? void 0 : commit.author) === null || _a === void 0 ? void 0 : _a.uid.toString();
            const contributor = initializedContributors[idKey];
            if (contributor) {
                contributor.commits += 1;
                if (!contributor.firstCommit || new Date(commit.createdAt) < new Date(contributor.firstCommit.createdAt)) {
                    contributor.firstCommit = commit;
                }
                if (!contributor.lastCommit || new Date(commit.createdAt) > new Date(contributor.lastCommit.createdAt)) {
                    contributor.lastCommit = commit;
                }
            }
        });
        req.contributorsCommitsData = initializedContributors;
        next();
    }
    catch (error) {
        console.error('(getContributorsCommits) Error getting contributors commits:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.getContributorsCommits = getContributorsCommits;
const getCommitsHashes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid1, uuid2 } = req.query;
    try {
        if (uuid2 === '' && uuid1 !== '') {
            const commit1 = yield commitSchema_1.default.findOne({ uuid: uuid1 })
                .select('hash repository')
                .populate('repository');
            if (!commit1) {
                return res.status(404).json({ message: 'Commit not found' });
            }
            req.hash1 = commit1 === null || commit1 === void 0 ? void 0 : commit1.hash;
            req.hash2 = null;
            req.gitlabId = commit1.repository.gitlabId;
            next();
        }
        else if (uuid1 === '' && uuid2 !== '') {
            const commit1 = yield commitSchema_1.default.findOne({ uuid: uuid2 })
                .select('hash repository')
                .populate('repository');
            if (!commit1) {
                return res.status(404).json({ message: 'Commit not found' });
            }
            req.hash1 = commit1 === null || commit1 === void 0 ? void 0 : commit1.hash;
            req.hash2 = null;
            req.gitlabId = commit1.repository.gitlabId;
            next();
        }
        else {
            const commit1 = yield commitSchema_1.default.findOne({ uuid: uuid1 })
                .select('hash repository')
                .populate('repository');
            const commit2 = yield commitSchema_1.default.findOne({ uuid: uuid2 })
                .select('hash');
            if (!commit1 || !commit2) {
                return res.status(404).json({ message: 'Commit not found' });
            }
            req.hash1 = commit1.hash;
            req.hash2 = commit2.hash;
            req.gitlabId = commit1.repository.gitlabId;
            next();
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
exports.getCommitsHashes = getCommitsHashes;
const getCommits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { task } = req;
    if (!(task === null || task === void 0 ? void 0 : task.commits_hashes) || task.commits_hashes.length === 0) {
        req.commits = [];
        return next();
    }
    try {
        const commits = yield commitSchema_1.default.find({ uuid: { $in: task.commits_hashes } })
            .select('uuid createdAt author')
            .sort({ createdAt: -1 })
            .lean();
        req.commits = commits;
        next();
    }
    catch (error) {
        console.error('Error getting commits:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.getCommits = getCommits;
const findCommit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { hash } = req.params;
    try {
        const commit = yield commitSchema_1.default.findOne({ uuid: hash });
        if (!commit) {
            return res.status(404).json({ message: 'Commit not found' });
        }
        req.commit = commit;
        next();
    }
    catch (error) {
        console.error('Error finding commit:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.findCommit = findCommit;
const getProjectCommitsBaseOnAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { levels, owner, type } = req;
    const queryYear = req.query.year;
    const year = parseInt(queryYear, 10);
    const uid = req.query.uid;
    if (owner && owner === true) {
        return next();
    }
    let matchConditions = { project: projectID };
    if (year) {
        matchConditions = Object.assign(Object.assign({}, matchConditions), { createdAt: {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            } });
    }
    try {
        if (type === 'collaborator') {
            const commits = yield commitSchema_1.default.find(matchConditions)
                .populate('layer repository associated_task')
                .select('-hash')
                .sort({ createdAt: -1 })
                .lean();
            // ! Commits en el que el usuario tiene acceso como colaborador ( state : true )
            const filteredCommitsBaseOnLevel = (yield Promise.all(commits.map((commit) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer, repository } = commit;
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'layer._id': layer._id });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, state: true, 'repository._id': repository._id });
                if (cLayer && cRepo) {
                    const commitWithIdsOnly = Object.assign(Object.assign({}, commit), { layer: layer._id, repository: repository._id });
                    return commitWithIdsOnly;
                }
            })))).filter((commit) => commit !== undefined);
            // ! Commits en el caso de que el usuario no tiene acceso como colaborador ( state: false ), pero los padres son abiertos
            const uniqueCommitsOnOpenParents = (yield Promise.all(commits.filter((openCommit) => !filteredCommitsBaseOnLevel.some(commit => commit._id.toString() === openCommit._id.toString())).map((commit) => __awaiter(void 0, void 0, void 0, function* () {
                const { layer: { _id: layerId, visibility: layerVis }, repository: { _id: repoId, visibility: repoVis } } = commit, rest = __rest(commit, ["layer", "repository"]);
                const cLayer = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'layer._id': layerId });
                const cRepo = yield collaboratorSchema_1.default.findOne({ uid, projectID, 'repository._id': repoId });
                if (evalAccess(cLayer, cRepo, layerVis, repoVis)) {
                    return Object.assign(Object.assign({}, rest), { layer: layerId, repository: repoId });
                }
                ;
            })))).filter((commit) => commit !== undefined);
            req.commits = [...filteredCommitsBaseOnLevel, ...uniqueCommitsOnOpenParents];
            return next();
        }
        else {
            const commits = yield commitSchema_1.default.find(matchConditions)
                .populate('layer repository associated_task')
                .select('-hash')
                .sort({ createdAt: -1 })
                .lean();
            if (commits.length === 0) {
                req.commits = [];
                return next();
            }
            // ! Commits en el caso de que el usuario sea un guest
            const filteredCommitsBaseOnLevel = commits.reduce((acc, commit) => {
                const { layer, repository } = commit;
                if (layer && repository && levels && levels.includes(layer.visibility) && levels.includes(repository.visibility)) {
                    const commitWithIdsOnly = Object.assign(Object.assign({}, commit), { layer: layer._id, repository: repository._id });
                    acc.push(commitWithIdsOnly);
                }
                ;
                return acc;
            }, []);
            req.commits = filteredCommitsBaseOnLevel;
            return next();
        }
        ;
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getProjectCommitsBaseOnAccess = getProjectCommitsBaseOnAccess;
const getCommitsLength = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { currentYear, currentMonth } = req.query;
    // Convertir a números si no lo son, ya que los parámetros de la consulta son recibidos como strings
    const year = Number(currentYear);
    const month = Number(currentMonth);
    if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({
            message: "Invalid year or month"
        });
    }
    // Ajuste para el índice de mes correcto (-1 si los meses vienen de 1 a 12)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
        return res.status(400).json({
            message: "Generated dates are invalid."
        });
    }
    const filter = {
        'author.uid': uid,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };
    try {
        const commits = yield commitSchema_1.default.find(filter);
        req.commitsLength = commits.length;
        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error',
            error
        });
    }
});
exports.getCommitsLength = getCommitsLength;
const getCommitsDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    try {
        const commits1 = yield commitSchema_1.default.find({ 'author.uid': uid, associated_task: null, createdAt: { $gte: startDate, $lte: endDate } })
            .select('createdAt uuid author _id repository branch')
            .populate('repository', 'name')
            .sort({ createdAt: -1 })
            .lean();
        const commits2 = yield commitSchema_1.default.find({ 'author.uid': uid, associated_task: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } })
            .select('createdAt uuid author _id repository branch associated_task')
            .populate('repository', 'name')
            .populate('associated_task', 'task_name')
            .sort({ createdAt: -1 })
            .lean();
        req.commitsData = { commits1, commits2 };
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server error'
        });
    }
});
exports.getCommitsDates = getCommitsDates;
const getProjectCommitsDates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { startDate, endDate, uid } = req.query;
    try {
        const commits1 = yield commitSchema_1.default.find({ project: projectId, 'author.uid': uid, associated_task: null, createdAt: { $gte: startDate, $lte: endDate } })
            .select('createdAt uuid author _id repository branch')
            .populate('repository', 'name')
            .sort({ createdAt: -1 })
            .lean();
        const commits2 = yield commitSchema_1.default.find({ project: projectId, 'author.uid': uid, associated_task: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } })
            .select('createdAt uuid author _id repository branch associated_task')
            .populate('repository', 'name')
            .populate('associated_task', 'task_name')
            .sort({ createdAt: -1 })
            .lean();
        req.commitsData = { commits1, commits2 };
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server error'
        });
    }
});
exports.getProjectCommitsDates = getProjectCommitsDates;
const getProfileCommitsFiltered = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { year } = req.query;
    let matchCondition = { 'author.uid': uid };
    if (year) {
        matchCondition = Object.assign(Object.assign({}, matchCondition), { createdAt: {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            } });
    }
    try {
        const commits = yield commitSchema_1.default.find(matchCondition)
            .select('createdAt uuid author _id repository layer project')
            .populate('repository', 'visibility name')
            .populate('layer', 'visibility name')
            .populate('project', 'visibility name')
            .populate('associated_task', 'task_name')
            .sort({ createdAt: -1 })
            .lean();
        const filteredCommits = commits.reduce((acc, commit) => {
            const { layer, repository, project } = commit;
            if ((0, exports.validateVisibility)(project.visibility, layer.visibility, repository.visibility)) {
                acc.push(commit);
            }
            return acc;
        }, []);
        req.commits = filteredCommits;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
    ;
});
exports.getProfileCommitsFiltered = getProfileCommitsFiltered;
const validateVisibility = (pVisisibility, lVisibility, rVisibility) => {
    if (pVisisibility === 'public' && lVisibility === 'open' && rVisibility === 'open') {
        return true;
    }
    return false;
};
exports.validateVisibility = validateVisibility;
//# sourceMappingURL=commits-middlewares.js.map