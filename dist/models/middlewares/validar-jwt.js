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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../userSchema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validarJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({
            state: false,
            msg: 'No hay token un token valido en la peticion'
        });
    }
    if (token === undefined) {
        return res.status(400).json({
            state: false,
            msg: 'No hay token un token valido en la peticion'
        });
    }
    try {
        if (!process.env.SECRETORPRIVATEKEY)
            return res.status(400).json({ msg: 'Enviroment variable has not been set' });
        const response = jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY);
        const user = yield userSchema_1.default.findById(response.uid);
        console.log(response);
        console.log(user);
        // ! verificar que el user exista
        if (!user)
            return res.status(401).json({
                state: false,
                msg: 'El usuario no existe'
            });
        // ! verificar si el estado de usuario es true
        // if( !user.state ) return res.status(401).json({
        //         msg: 'Token no valido / Usuario no autorizado'
        //     });
        req.authenticatedUser = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            state: false,
            msg: 'Token no valido'
        });
    }
});
exports.default = validarJWT;
//# sourceMappingURL=validar-jwt.js.map