import { Router} from 'express';
import * as commentController from '../controllers/comments'


const router = Router();

router.post( '/create-comment', commentController.createCommentOrReply  );
// router.get( '/get-comments/:projectId', commentController.getAllComments  );
router.get( '/get-comments/:projectId', commentController.getAllCommentss  );
router.get( '/get-replies/:commentId', commentController.getCommentReplies  );



export default router;


