import { Router } from 'express';
import * as layerController from '../controllers/layers';
import { validateJWT } from '../middlewares/auth/validateJWT';
import { validateProjectExistance, validateUserAccessOnProject, validateCollaboratorAccessOnProject } from '../middlewares/project/project-middlewares';
import { updateLayerCollaborators, validateLayerExistance, validateCollaboratorAccessOnLayer, 
    verifyProjectLevelAccessOfNewCollaborator, deleteCollaborators, newCollaborators, createOtherCDataOfLayerCreatedCollaborators,
         updateOtherCDataOfLayerModifiedCollaborators, updateOtherCDataOfDeletedLayerCollaborators, getProjectLayersDataBaseOnAccess, verifyProjectLayers } from '../middlewares/layer/layer-middlewares';



const router = Router();

router.post('/create-layer/:projectID', [
    validateJWT,
    validateProjectExistance,
    validateCollaboratorAccessOnProject(['administrator', 'manager']),
    verifyProjectLayers ], layerController.createLayer);

router.get('/get-layer/:layerID', [
    // validateJWT
], layerController.getLayersById);




router.get('/get-layers/:projectID', [
    validateProjectExistance,
    validateUserAccessOnProject,
    getProjectLayersDataBaseOnAccess ], layerController.getLayersByProjectId);


router.get('/get-layer-collaborators/:layerID', layerController.getLayerCollaborators);


router.put('/update-layer/:projectID/:layerID', [
    validateJWT,
    validateProjectExistance,
    validateLayerExistance,
    validateCollaboratorAccessOnLayer(['administrator']) ], layerController.updateLayer );


router.put('/collaborators/:projectID/:layerID', [
    validateJWT,
    validateProjectExistance,
    validateLayerExistance,
    validateCollaboratorAccessOnLayer(['administrator']),
    deleteCollaborators,
    updateOtherCDataOfDeletedLayerCollaborators,
    updateLayerCollaborators,
    updateOtherCDataOfLayerModifiedCollaborators,
    verifyProjectLevelAccessOfNewCollaborator,
    newCollaborators,
    createOtherCDataOfLayerCreatedCollaborators], layerController.response );
    
router.delete('/delete-layer/:layerID', layerController.deleteLayer );


export default router;



