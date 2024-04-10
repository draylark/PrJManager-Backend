import { Router } from 'express';
import * as searcherController from '../controllers/searcher'


const router = Router();


router.post( '/:type', searcherController.searcher  )


export default router;


