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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const layerController = __importStar(require("../controllers/layers"));
const validateJWT_1 = require("../middlewares/validateJWT");
const project_middlewares_1 = require("../middlewares/project-middlewares");
const layer_middlewares_1 = require("../middlewares/layer-middlewares");
const router = (0, express_1.Router)();
router.get('/get-layer/:layerID', layerController.getLayersById);
router.post('/create-layer/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    (0, project_middlewares_1.validateCollaboratorAccessOnProject)(['administrator', 'manager']),
    layer_middlewares_1.verifyProjectLayers
], layerController.createLayer);
router.get('/get-layers/:projectID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    project_middlewares_1.validateUserAccessOnProject,
    layer_middlewares_1.getProjectLayersDataBaseOnAccess
], layerController.getLayersByProjectId);
router.put('/update-layer/:projectID/:layerID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    layer_middlewares_1.validateLayerExistance,
    (0, layer_middlewares_1.validateCollaboratorAccessOnLayer)(['administrator']),
], layerController.updateLayer);
router.delete('/delete-layer/:layerID', layerController.deleteLayer);
router.post('/add-layer-collaborator/:layerID', layerController.addLayerCollaborator);
router.put('/collaborators/:projectID/:layerID', [
    validateJWT_1.validateJWT,
    project_middlewares_1.validateProjectExistance,
    layer_middlewares_1.validateLayerExistance,
    (0, layer_middlewares_1.validateCollaboratorAccessOnLayer)(['administrator']),
    layer_middlewares_1.deleteCollaborators,
    layer_middlewares_1.updateOtherCDataOfDeletedLayerCollaborators,
    layer_middlewares_1.updateLayerCollaborators,
    layer_middlewares_1.updateOtherCDataOfLayerModifiedCollaborators,
    layer_middlewares_1.verifyProjectLevelAccessOfNewCollaborator,
    layer_middlewares_1.newCollaborators,
    layer_middlewares_1.createOtherCDataOfLayerCreatedCollaborators
], layerController.response);
router.get('/get-layer-collaborators/:layerID', [
    validateJWT_1.validateJWT
], layerController.getLayerCollaborators);
exports.default = router;
//# sourceMappingURL=layersR.js.map