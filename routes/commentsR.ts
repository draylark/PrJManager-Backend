import { Router} from 'express';
import * as commentController from '../controllers/comments'
import { validateJWT } from '../middlewares/auth/validateJWT';

const router = Router();

router.post('/create-comment', commentController.createCommentOrReply  );
// router.get( '/get-comments/:projectId', commentController.getAllComments  );
router.get( '/get-comments/:projectId', [validateJWT], commentController.getAllComments  );
router.get( '/get-replies/:commentId', commentController.getCommentReplies  );
router.put( '/like-comment', commentController.updateComment );
router.put( '/delete-comment/:id', commentController.deleteComment );



export default router;


