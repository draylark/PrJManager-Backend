import { Router } from 'express';
import { check } from 'express-validator'
import * as uController from '../controllers/users';
import validarJWT from '../middlewares/validar-jwt';
import { showRole } from '../middlewares/validar-roles';
import { isIdExist } from '../helpers/dvValidators';
import { getProjectsLength, getCreatedProjectsDates } from '../middlewares/project-middlewares';
import { getCommitsLength, getCommitsDates, getProjectCommitsDates } from '../middlewares/commits-middlewares';
import { getCompletedTasksLength, getTasksDates, getProjectTasksDates } from '../middlewares/tasks-middlewares';
import { getCreatedLayersDates, getProjectCreatedLayersDates } from '../middlewares/layer-middlewares';
import { getCreatedReposDates, geProjectCreatedReposDates } from '../middlewares/repository-middlewares';
import { handleAndOrganizeData, handleAndOrganizeProjectData } from '../middlewares/helpers-middlewares';
import { validateJWT } from '../middlewares/validateJWT';

const router = Router()



router.post('/', uController.getUsers);

router.get('/find-user', uController.findUsers)

router.get('/get-users-relation', uController.getUsersRelation);

router.get('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], uController.getUsersById);

router.get('/get-profile/:uid', uController.getProfile);



 // ? User Activity

router.get('/my-monthly-activity/:uid', [
    getProjectsLength,
    getCommitsLength,
    getCompletedTasksLength
], uController.getMyMonthlyActivity);

router.get('/timeline-activity/:uid', [
    // validateJWT,
    getCreatedProjectsDates,
    getCreatedLayersDates,
    getCreatedReposDates,
    getCommitsDates,
    getTasksDates,
    handleAndOrganizeData
], uController.getTimelineActivity);

router.get('/project-timeline-activity/:projectId', [
    getProjectCreatedLayersDates,
    geProjectCreatedReposDates,
    getProjectCommitsDates,
    getProjectTasksDates,
    handleAndOrganizeProjectData
], uController.getProjectTimelineActivity);



router.get('/get-followers-length/:uid', uController.getFollowersLength);

router.put('/update-top-projects/:uid', [validateJWT], uController.updateUserTopProjects);



 // ? User Friends

router.get('/get-profile-followers-following/:profileUID', uController.getProfileFollowersFollowing);

router.get('/get-fll-flly-friends/:uid', uController.getFollowersAndFollowingFriends);
router.get('/get-fll/:profileUID', uController.getFollowers);
router.get('/get-flly/:profileUID', uController.getFollowing);
router.get('/get-friends/:uid', uController.getFriends);

router.post('/follow-profile', uController.followProfile);

router.delete('/unfollow-profile/:profileUID',  uController.unfollowProfile);


router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist ),
    showRole('ADMIN_ROLE', 'VENTAS_ROLE'),
], uController.deleteUsers);

router.put('/update-my-links/:uid', uController.updateMyLinks);

router.put('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], uController.putUsers);
















export default router