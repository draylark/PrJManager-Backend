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
exports.getProjectCommitsBaseOnAccess = exports.findCommit = void 0;
const commitSchema_1 = __importDefault(require("../models/commitSchema"));
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
    const { levels, owner } = req;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
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
        const commits = yield commitSchema_1.default.find(matchConditions)
            .populate('layer repository');
        const filteredCommitsBaseOnLevel = commits.reduce((acc, commit) => {
            const { layer, repository } = commit;
            // Verifica que ambos documentos estén poblados y tienen propiedad 'visibility'.
            if (layer && repository && levels.includes(layer.visibility) && levels.includes(repository.visibility)) {
                // Crea una nueva representación de la tarea que solo incluye los ObjectIds de los documentos relacionados.
                const commitWithIdsOnly = Object.assign(Object.assign({}, commit.toObject()), { layer: layer._id, repository: repository._id });
                acc.push(commitWithIdsOnly);
            }
            ;
            return acc;
        }, []);
        req.commits = filteredCommitsBaseOnLevel;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.getProjectCommitsBaseOnAccess = getProjectCommitsBaseOnAccess;
//# sourceMappingURL=commits-middlewares.js.map