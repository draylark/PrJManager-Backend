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
exports.likes = void 0;
const likeSchema_1 = __importDefault(require("../models/likeSchema"));
const likes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, uid, type } = req.body;
    // Validación de los datos de entrada...
    try {
        const existingLike = yield likeSchema_1.default.findOne({ commentId, uid });
        if (existingLike) {
            if (type !== null) {
                existingLike.type = type;
                yield existingLike.save();
                res.status(200).json({ message: 'Like/Dislike actualizado', like: existingLike });
            }
            else {
                yield existingLike.deleteOne();
                res.status(200).json({ message: 'Like/Dislike eliminado' });
            }
        }
        else {
            const newLike = new likeSchema_1.default({ commentId, uid, type });
            yield newLike.save();
            res.status(201).json({ message: 'Like/Dislike creado', like: newLike });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});
exports.likes = likes;
//# sourceMappingURL=likes.js.map