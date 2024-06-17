import { Router } from 'express';
import { check } from 'express-validator'
import { getNotisbyUserId, postNoti, putNoti } from '../controllers/notis';
import { isIdExist } from '../helpers/dvValidators';


const router = Router()


router.get('/:uid', getNotisbyUserId);

router.post('/', postNoti);

router.put('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( isIdExist )
], putNoti);






export default router