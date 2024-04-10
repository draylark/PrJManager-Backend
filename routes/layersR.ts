import { Router } from 'express';
import * as layerController from '../controllers/layers';
import { validateJWT } from '../middlewares/validateJWT';
import { validateProjectExistance, ownerOrCollaborator, validateUserAccessOnProject } from '../middlewares/project-middlewares';
import { updateLayerCollaborators, validateLayerExistance, validateCollaboratorAccessOnLayer, 
         verifyOneLevelAccessOfNewCollaborator, deleteCollaborators, newCollaborators, createOtherCDataOfLayerCreatedCollaborators,
         updateOtherCDataOfLayerModifiedCollaborators, updateOtherCDataOfDeletedLayerCollaborators, getProjectLayersDataBaseOnAccess } from '../middlewares/layer-middlewares';



const router = Router();


router.get('/get-layer/:layerID', 
    layerController.getLayersById 
);


router.post('/create-layer/:projectID', layerController.createLayer );

router.get('/get-layers/:projectID', 
    [
        validateJWT,
        validateProjectExistance,
        validateUserAccessOnProject,
        getProjectLayersDataBaseOnAccess
    ], 
    layerController.getLayersByProjectId 
);

router.put('/update-layer/:projectID/:layerID', 
     [
            validateJWT,
            validateProjectExistance,
            validateLayerExistance,
            validateCollaboratorAccessOnLayer(['administrator']),
     ],
     layerController.updateLayer );

router.delete('/delete-layer/:layerID', layerController.deleteLayer );

router.post('/add-layer-collaborator/:layerID', layerController.addLayerCollaborator );

router.put('/collaborators/:projectID/:layerID', 
    [
        validateJWT,
        validateProjectExistance,
        validateLayerExistance,
        validateCollaboratorAccessOnLayer(['administrator']),
        deleteCollaborators,
        updateOtherCDataOfDeletedLayerCollaborators,
        updateLayerCollaborators,
        updateOtherCDataOfLayerModifiedCollaborators,
        verifyOneLevelAccessOfNewCollaborator,
        newCollaborators,
        createOtherCDataOfLayerCreatedCollaborators
    ], 
    layerController.response 
);

router.get('/get-layer-collaborators/:layerID', 
    [ 
        validateJWT 
    ], 
    layerController.getLayerCollaborators 
);



export default router;



