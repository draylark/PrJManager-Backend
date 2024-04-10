import { Router } from "express";
import * as prjController from "../controllers/projects";
import { check } from "express-validator";
import validarJWT from "../middlewares/validar-jwt";
import validarCampos from "../middlewares/validar-campos";
import { isPrIdExist } from "../helpers/dvValidators";
import { validateJWT } from "../middlewares/validateJWT";
import { validateProjectExistance, validateCollaboratorAccessOnProject, newCollaborators, updateCollaborators, deleteCollaborators, 
        updateOtherCollaboratorDataOfDeletedCollaborators, updateOtherCDataOfProjectModifiedCollaborators, createOtherCDataOfProjectCreatedCollaborators, 
        handlePrJCollaboratorInvitation, returnDataBaseOnAccessLevel } from '../middlewares/project-middlewares';


const router = Router()



router.post('/create-project', [
    validarJWT,
    check('name', 'Name is Required').not().isEmpty(),
    check('description', 'Description is Required').not().isEmpty(),
    check('owner', 'Owner is Required').not().isEmpty(),
    validarCampos
], prjController.postProject);

router.get('/get-project/:userId', prjController.getProject);

router.get('/get-project-by-id/:projectId', prjController.getProjectById);


router.get('/get-projects/:uid', prjController.getProjects);

router.put('/update-project/:projectID', 
        [ 
            validateJWT,
            validateProjectExistance,
            validateCollaboratorAccessOnProject( ['manager', 'administrator'] )
        ],       
        prjController.updateProject);


router.delete('/delete-project/:id',[
    validarJWT,
    check('id', 'It is not a valid MongoId').isMongoId(),
    check('id').custom( isPrIdExist ),
    validarCampos
], prjController.deleteProject);


router.get('/collaborators/:projectID', prjController.getCollaborators)

router.put('/collaborators/:projectID', 
    [
        validateJWT,
        validateProjectExistance,
        validateCollaboratorAccessOnProject( ['administrator'] ),
        deleteCollaborators,
        updateOtherCollaboratorDataOfDeletedCollaborators,
        updateCollaborators,
        updateOtherCDataOfProjectModifiedCollaborators,
        newCollaborators,
        // createOtherCDataOfProjectCreatedCollaborators
        
    ],
     prjController.response)


router.put('/handle-invitation/:projectID', [validateJWT, validateProjectExistance, 
    handlePrJCollaboratorInvitation, createOtherCDataOfProjectCreatedCollaborators ],  prjController.response)

router.get('/readme/:readmeID', prjController.getReadme)



export default router