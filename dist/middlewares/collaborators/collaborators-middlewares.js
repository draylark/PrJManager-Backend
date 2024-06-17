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
exports.addNewRepoCollaborators = exports.addNewLayerCollaborators = exports.updatingCollaborators = void 0;
const collaboratorSchema_1 = __importDefault(require("../../models/collaboratorSchema"));
const updatingCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    const { modifiedCollaborators } = req.body;
    if (modifiedCollaborators.length === 0) {
        return next();
    }
    try {
        yield Promise.all(modifiedCollaborators.map(collaborator => collaboratorSchema_1.default.findOneAndUpdate({ uid: collaborator.id, 'layer._id': layerID }, { $set: { 'layer.accessLevel': collaborator.accessLevel } })));
        console.log('Collaborators updated');
        req.collaboratorsUpdated = true;
        next();
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Es buena práctica dar más contexto sobre el error
        });
    }
});
exports.updatingCollaborators = updatingCollaborators;
const addNewLayerCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerNewCollaborators, projectID, projectAccessLevel } = req.body;
    if (layerNewCollaborators.length === 0) {
        return next();
    }
    try {
        yield Promise.all(layerNewCollaborators.map(collaborator => {
            const collaboratorData = {
                layer: {
                    _id: collaborator.layerID,
                    accessLevel: collaborator.accessLevel,
                },
            };
            const newCollaborator = new collaboratorSchema_1.default(collaboratorData);
            return newCollaborator.save();
        }));
        req.collaboratorsAdded = true;
        next();
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }
});
exports.addNewLayerCollaborators = addNewLayerCollaborators;
const addNewRepoCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { collaborators, projectID, layerID } = req.body;
    const { repoID } = req;
    if (collaborators.length === 0) {
        return next();
    }
    try {
        yield Promise.all(collaborators.map(collaborator => {
            const collaboratorData = {
                repository: {
                    _id: repoID,
                    accessLevel: collaborator.accessLevel,
                },
                uid: collaborator.id,
                name: collaborator.name,
                photoUrl: collaborator.photoUrl
            };
            const newCollaborator = new collaboratorSchema_1.default(collaboratorData);
            return newCollaborator.save();
        }));
        req.collaboratorsAdded = true;
        next();
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }
});
exports.addNewRepoCollaborators = addNewRepoCollaborators;
//# sourceMappingURL=collaborators-middlewares.js.map