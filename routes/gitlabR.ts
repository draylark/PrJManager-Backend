import express from 'express';
import * as gitController from '../controllers/gitlab';
import { loadContentFile } from '../controllers/gitlab';
import { validateRepositoryExistance } from '../middlewares/others/DB-validators';
import { validateJWT } from '../middlewares/auth/validateJWT';
import multer from 'multer';
import { getCommitsHashes } from '../middlewares/commit/commits-middlewares';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/get-layers/:userId', gitController.getAllGroups );
router.get('/loadRepoFiles/:repoID/:branch', [ validateJWT, validateRepositoryExistance ], gitController.loadRepoFiles );
router.get('/loadContentFile/:repoID', [ validateJWT, validateRepositoryExistance ], gitController.loadContentFile );
router.get('/loadFolderContents/:repoID', [ validateJWT, validateRepositoryExistance ], gitController.loadFolderContents );

router.get('/diff/:uuid1?/:uuid2?', [ getCommitsHashes ], gitController.diffCommits );


router.post('/create-group', gitController.createGroup );
router.post('/create-repo', gitController.createRepo );
router.post('/update-layer/:layerId', gitController.updateLayer );




export default router;


