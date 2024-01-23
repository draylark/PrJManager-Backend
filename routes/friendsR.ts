import { Router } from 'express';
import * as friendsController from '../controllers/friends'


const router = Router();




router.post('/add-friend/:userId', friendsController.addFriend)


router.post('/manage-request/:userId', friendsController.manageFriendsRequests)


export default router;



