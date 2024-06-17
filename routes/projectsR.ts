import { Router } from "express";
import * as prjController from "../controllers/projects";
import { check } from "express-validator";
import { isPrIdExist } from "../helpers/dvValidators";
import { validateJWT } from "../middlewares/auth/validateJWT";
import { validateProjectExistance,  validateCollaboratorAccessOnProject, newCollaborators, updateCollaborators, deleteCollaborators, 
        updateOtherCollaboratorDataOfDeletedCollaborators, updateOtherCDataOfProjectModifiedCollaborators, createOtherCDataOfProjectCreatedCollaborators, 
        handlePrJCollaboratorInvitation, itIsTheOwner, validateUserAccessBaseOnProjectVisibility, createProject, validateUserProjects } from '../middlewares/project/project-middlewares';


const router = Router()

router.post('/create-project', [
    validateJWT,
    validateUserProjects,
    createProject ], prjController.postProject);

router.get('/get-project/:userId', prjController.getProject);

router.get('/get-project-by-id/:projectID', [ 
    validateProjectExistance, 
    validateUserAccessBaseOnProjectVisibility ], prjController.getProjectById);

router.get('/get-projects/:uid', prjController.getProjects);

router.get('/get-profile-public-projects/:uid', prjController.getProfilePublicProjects);
router.get('/get-profile-top-projects/:uid', prjController.getProfileTopProjects);

router.get('/collaborators/:projectID', prjController.getCollaborators)

router.get('/readme/:readmeID', prjController.getReadme)


router.get('/timeline-activity/:projectId', prjController.getMyProjectTimelineActivity);

router.put('/update-project/:projectID', [  
        validateJWT,
        validateProjectExistance,
        itIsTheOwner ], prjController.updateProject);

router.put('/collaborators/:projectID',  [
    validateJWT,
    validateProjectExistance,
    validateCollaboratorAccessOnProject( ['administrator'] ),
    deleteCollaborators,
    updateOtherCollaboratorDataOfDeletedCollaborators,
    updateCollaborators,
    updateOtherCDataOfProjectModifiedCollaborators,
    newCollaborators,
    createOtherCDataOfProjectCreatedCollaborators ], prjController.response)
        
   
router.put('/handle-invitation/:projectID', [
    validateJWT, 
    validateProjectExistance, 
    handlePrJCollaboratorInvitation, 
    createOtherCDataOfProjectCreatedCollaborators ],  prjController.prjInvitationCallback)

router.delete('/delete-project/:id',[
    check('id', 'It is not a valid MongoId').isMongoId(),
    check('id').custom( isPrIdExist ),
    ], prjController.deleteProject);


export default router