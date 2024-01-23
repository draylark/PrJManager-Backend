import express from 'express';
import * as gitController from '../controllers/gitlab';
import { loadContentFile } from '../controllers/gitlab';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// router.get('/auth', gitController.callback );

// router.get('/access-token', (req, res) => { 
//     const accessToken = req.cookies['gitlabToken'];
//     if (accessToken) {
//         res.json({ token: accessToken });
//     } else {
//       res.status(400).send('No se encontró el token de acceso');
//     }
// } )



router.get('/get-layers/:userId', gitController.getAllGroups );
router.get('/loadRepoFiles/:repoId', gitController.loadRepoFiles );
router.get('/loadContentFile/:repoId', gitController.loadContentFile );
router.get('/loadFolderContents/:repoId', gitController.loadFolderContents );

router.post('/create-group', gitController.createGroup );
router.post('/create-repo', gitController.createRepo );
router.post('/update-layer/:layerId', gitController.updateLayer );
router.post('/requestAccess', upload.single('file'), gitController.requestAccess );



export default router;


