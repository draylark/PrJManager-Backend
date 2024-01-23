import { Router } from 'express';
import * as likesController from '../controllers/likes'


const router = Router();

router.post('/', likesController.likes)


export default router;



