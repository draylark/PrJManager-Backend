"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_1 = require("../controllers/events");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const router = (0, express_1.Router)();
router.post('/', [
    validar_campos_1.default
], events_1.postEvent);
router.get('/:userId', events_1.getEvents);
exports.default = router;
//# sourceMappingURL=eventsR.js.map