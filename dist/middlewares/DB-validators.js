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
exports.validateRepositoryExistance = exports.validateLayerExistance = exports.validateProjectExistance = void 0;
const layerSchema_1 = __importDefault(require("../models/layerSchema"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
const validateProjectExistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.body;
    try {
        if (!projectID)
            res.status(400).json({
                message: 'Project not found'
            });
        const project = yield projectSchema_1.default.findById(projectID);
        if (!project)
            return res.status(400).json({
                success: false,
                message: 'Project not found, the repository cannot be created if the project was deleted or closed, please check if the project exists or consult with the owner of the project, if the error persists, please report the error to the PrJ Team.'
            });
        next();
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }
    ;
});
exports.validateProjectExistance = validateProjectExistance;
const validateLayerExistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.body;
    try {
        if (!layerID)
            res.status(400).json({
                message: 'Layer not found'
            });
        const layer = yield layerSchema_1.default.findOne({ _id: layerID });
        if (!layer)
            res.status(400).json({
                success: false,
                message: 'Layer not found, the repository cannot be created if the layer was deleted or closed, please check if the layer exists or consult with the owner of the project or the layer, if the error persists, please report the error to the PrJ Team.'
            });
        req.gitlabGroupID = layer.gitlabId;
        next();
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }
    ;
});
exports.validateLayerExistance = validateLayerExistance;
const validateRepositoryExistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoID } = req.params;
    try {
        if (!repoID)
            res.status(400).json({
                message: 'Repository not found'
            });
        const repository = yield repoSchema_1.default.findOne({ _id: repoID });
        if (!repository)
            res.status(400).json({
                success: false,
                message: 'Repository not found, the repository cannot be created if the repository was deleted or closed, please check if the repository exists or consult with the owner of the project or the repository, if the error persists, please report the error to the PrJ Team.'
            });
        req.repoGitlabID = repository.gitlabId;
        next();
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }
    ;
});
exports.validateRepositoryExistance = validateRepositoryExistance;
//# sourceMappingURL=DB-validators.js.map