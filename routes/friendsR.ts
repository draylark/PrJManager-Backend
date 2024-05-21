import { Router } from 'express';
import * as friendsController from '../controllers/friends'
import { validateJWT } from '../middlewares/validateJWT';

const router = Router();



router.get('/get-friends/:uid', friendsController.getFriends)


router.post('/friend-request/:requestedUID', friendsController.newFriendRequest)


router.put('/handle-friend-request/:requesterID', [validateJWT], friendsController.handleFriendRequest)


export default router;



