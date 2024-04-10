import { Router } from 'express';
import * as friendsController from '../controllers/friends'


const router = Router();



router.get('/get-friends/:uid', friendsController.getFriends)


router.post('/add-friend/:requestedUID', friendsController.addFriend)


router.post('/handle-request/:requesterID', friendsController.manageFriendsRequests)


export default router;



