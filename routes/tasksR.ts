import { Router } from 'express';
import * as tasksController from '../controllers/tasks';
import validarJWT from '../middlewares/validar-jwt';
import { validateRepositoryExistance } from '../middlewares/DB-validators';
import { validateJWT } from '../middlewares/validateJWT';
import { validateUserAccessOnProject } from '../middlewares/project-middlewares';
import { validateProjectExistance } from '../middlewares/project-middlewares';
import { getCommits, getContributorsCommits } from '../middlewares/commits-middlewares';
import { getProjectTasksBaseOnAccess, getProjectTasksBaseOnAccessForHeatMap, validateCollaboratorAccess, getTaskData, updateParticipation, getTaskContributors, getProfileTasksFiltered } from '../middlewares/tasks-middlewares';
import { validateRepositoryExistance as getRepo } from '../middlewares/repository-middlewares';



const router = Router()



router.get('/:repoID', [ 
    validateJWT, 
    validateRepositoryExistance ], tasksController.getTasksByRepo);

router.get('/:taskId', tasksController.getTaskById);

router.get('/get-task-contributors/:taskId', [ getTaskContributors, getContributorsCommits ], tasksController.getTaskContributors);

router.get('/get-task-notes/:taskId', tasksController.getTaskNotes);

router.get('/get-task-commits/:taskId', [ getTaskData, getCommits ], tasksController.getTaskCommits);

router.get('/get-all-tasks/:id', tasksController.getTasks);

router.get('/activity/:projectID',[ 
    validateProjectExistance,
    validateUserAccessOnProject, 
    getProjectTasksBaseOnAccessForHeatMap ], tasksController.getProyectTasksDataForHeatMap);
                    
router.get('/activity-data/:projectID', [ 
    validateJWT,
    validateProjectExistance, 
    validateUserAccessOnProject, 
    getProjectTasksBaseOnAccess ], tasksController.getTasksByProject);

router.get('/get-profile-tasks/:uid', [getProfileTasksFiltered], tasksController.getProfileTasks);

router.get('/get-user-tasks/:uid', [ validateJWT ], tasksController.getUserTasks);

router.get('/top-projects-tasks/:uid', [ validateJWT ], tasksController.getTopProjectsTasks);

router.get('/get-tasks-for-dashboard/:uid', [ validateJWT ], tasksController.getTasksForDashboard);      
        
router.get('/repo-activity/:repoID', tasksController.getRepoTasksDataForHeatMap);

router.post('/:projectID/:layerID/:repoID', [ 
    validateJWT, 
    validateProjectExistance,
    getRepo,
    validateCollaboratorAccess(['coordinator', 'administrator']) ], tasksController.createNewTask);

router.put('/update-task-status/:projectID/:taskId', [ 
    validateJWT, 
    validateProjectExistance,
    validateCollaboratorAccess(['coordinator', 'administrator']) ], tasksController.updateTaskStatus);


router.put('/handle-task-invitation/:taskId', tasksController.handleTaskInvitation);

router.put('/update-participation/:taskId', [updateParticipation], tasksController.sendTaskToRevision);
   
router.put('/update-note/:noteId', tasksController.updateNote);

router.put('/update-task-contributors/:taskId', tasksController.updateTaskContributors);

router.put('/delete-task-contributor/:taskId', tasksController.deleteTaskContributor);

router.delete('/delete-note/:noteId', tasksController.deleteNote);


export default router