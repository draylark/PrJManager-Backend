"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const notis_1 = require("../controllers/notis");
const dvValidators_1 = require("../helpers/dvValidators");
const router = (0, express_1.Router)();
router.get('/:uid', notis_1.getNotisbyUserId);
router.post('/', notis_1.postNoti);
router.put('/:id', [
    (0, express_validator_1.check)('id', 'No es un ID valido').isMongoId(),
    (0, express_validator_1.check)('id').custom(dvValidators_1.isIdExist)
], notis_1.putNoti);
exports.default = router;
//# sourceMappingURL=notisR.js.map