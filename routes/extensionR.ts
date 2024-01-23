import { Router } from 'express';
import * as extensionController from '../controllers/extension'


const router = Router();

router.post('/login', extensionController.login)

export default router;



