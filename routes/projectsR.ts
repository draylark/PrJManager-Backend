import { Router } from "express";
import { deleteProject, getProject, postProject, putProject, calculateProjectProgress, getProjectById } from "../controllers/projects";
import { check } from "express-validator";
import validarJWT from "../middlewares/validar-jwt";
import validarCampos from "../middlewares/validar-campos";
import { isPrIdExist } from "../helpers/dvValidators";

const router = Router()



router.post('/create-project', [
    validarJWT,
    check('name', 'Name is Required').not().isEmpty(),
    check('description', 'Description is Required').not().isEmpty(),
    check('owner', 'Owner is Required').not().isEmpty(),
    validarCampos
], postProject);

router.get('/get-project/:userId', getProject);


router.get('/get-project-by-id/:projectId', getProjectById);


router.put('/update-project/:projectId', putProject);


router.delete('/delete-project/:id',[
    validarJWT,
    check('id', 'It is not a valid MongoId').isMongoId(),
    check('id').custom( isPrIdExist ),
    validarCampos
], deleteProject);



router.get('/calculate-progress/:projectId', calculateProjectProgress);


export default router