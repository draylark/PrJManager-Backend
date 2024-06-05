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
exports.response = exports.addLayerCollaborator = exports.getLayerCollaborators = exports.deleteLayer = exports.updateLayer = exports.getLayersById = exports.getLayersByProjectId = exports.createLayer = void 0;
const layerSchema_1 = __importDefault(require("../models/layerSchema"));
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const axios_1 = __importDefault(require("axios"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const createLayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { name, description, visibility, parent_id = '80502948', creator } = req.body;
    try {
        const gitlabAccessToken = process.env.IDK;
        const permanentVsibility = 'private';
        const path = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const response = yield axios_1.default.post('https://gitlab.com/api/v4/groups', {
            name,
            path,
            description,
            permanentVsibility,
            parent_id,
        }, {
            headers: {
                'Authorization': `Bearer ${gitlabAccessToken}`,
            },
        });
        const layer = response.data;
        const newLayer = new layerSchema_1.default({
            name: name,
            path: layer.path,
            description: description,
            visibility,
            project: projectID,
            creator,
            gitlabId: layer.id
        });
        yield newLayer.save();
        const updatedProject = yield projectSchema_1.default.findByIdAndUpdate(projectID, { $inc: { layers: 1 } }, // Incrementa el contador de 'layers' en 1
        { new: true });
        res.json({
            newLayer,
            updatedProject,
        });
    }
    catch (error) {
        console.log(error);
        console.log(error.response ? error.response.data : error.message);
        res.json({ message: error.message });
    }
});
exports.createLayer = createLayer;
const getLayersByProjectId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectID } = req.params;
    const { owner, layers } = req;
    const uid = req.query.uid;
    try {
        if (owner && owner === true) {
            const layers = yield layerSchema_1.default.find({ project: projectID });
            return res.status(200).json({
                msg: 'Layers by Project ID',
                total: layers.length,
                layers
            });
        }
        else {
            return res.status(200).json({
                msg: 'Layers by Project ID',
                total: layers.length,
                layers
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
    ;
});
exports.getLayersByProjectId = getLayersByProjectId;
const getLayersById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    try {
        const layer = yield layerSchema_1.default.findById(layerID);
        return res.status(200).json({
            message: 'Layer by ID',
            layer
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
    ;
});
exports.getLayersById = getLayersById;
const updateLayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    const body = req.body;
    try {
        yield layerSchema_1.default.findByIdAndUpdate(layerID, body);
        res.status(200).json({
            message: 'Layer Updated'
        });
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
});
exports.updateLayer = updateLayer;
const deleteLayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    res.status(200).json({
        msg: 'Layer Updated',
        layerID
    });
});
exports.deleteLayer = deleteLayer;
const getLayerCollaborators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
    try {
        const collaborators = yield collaboratorSchema_1.default.find({ "layer._id": layerID, state: true });
        if (!collaborators)
            return res.status(404).json({
                msg: 'This layer has no collaborators yet',
                collaborators: []
            });
        res.status(200).json({
            collaborators
        });
    }
    catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
    ;
});
exports.getLayerCollaborators = getLayerCollaborators;
const addLayerCollaborator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerID } = req.params;
});
exports.addLayerCollaborator = addLayerCollaborator;
const response = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { creatingMiddlewareState, updatingMiddlewareState, deletingMiddlewareState, totalCreatedCollaborators, totalDeletedCollaborators } = req;
    let messageParts = []; // Para acumular partes del mensaje basado en las operaciones realizadas
    // Crear mensajes según el estado de cada operación
    if (deletingMiddlewareState) {
        messageParts.push(`${totalDeletedCollaborators} collaborator(s) deleted.`);
    }
    if (updatingMiddlewareState) {
        messageParts.push("Collaborators updated successfully.");
    }
    if (creatingMiddlewareState) {
        messageParts.push(`${totalCreatedCollaborators} new collaborator(s) added.`);
    }
    // Construir el mensaje final
    const finalMessage = messageParts.join(' ');
    // Enviar la respuesta
    res.json({
        success: true,
        message: finalMessage
    });
});
exports.response = response;
//# sourceMappingURL=layers.js.map