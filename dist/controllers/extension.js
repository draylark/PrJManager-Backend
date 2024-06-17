"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const SocketServer_1 = require("../../servers/SocketServer");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const io = (0, SocketServer_1.getSocket)();
    console.log('vuenasss desde el server');
    io.emit('message', id);
    res.json({
        ok: true,
        msg: 'login'
    });
});
exports.login = login;
//# sourceMappingURL=extension.js.map