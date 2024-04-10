import { Router } from 'express';
import * as likesController from '../controllers/likes'


const router = Router();

router.post('/:commentId', likesController.newLike)

router.put('/:commentId', likesController.updateLike)

router.get('/:commentId/:uid', likesController.getLikes)

export default router;



