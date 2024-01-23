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
exports.searcher = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const searcher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.params;
    const { searchTerm } = req.body;
    const { limit = 5, from = 0 } = req.query;
    if (!searchTerm.trim()) {
        return res.status(400).json({ msg: 'Search term is empty' });
    }
    if (type) {
        try {
            switch (type) {
                case 'users':
                    const users = yield userSchema_1.default.find({ username: { $regex: searchTerm, $options: 'i' } })
                        .skip(from)
                        .limit(limit);
                    if (users.length === 0) {
                        return res.status(404).json({ msg: 'No users found' });
                    }
                    return res.json({ users });
                default:
                    return res.status(400).json({ msg: 'Bad request' });
            }
        }
        catch (error) {
            // Manejar errores, por ejemplo, errores de la base de datos
            return res.status(500).json({ msg: 'Server error', error: error.message });
        }
    }
    const users = yield userSchema_1.default.find({ username: { $regex: searchTerm, $options: 'i' } })
        .skip(from)
        .limit(limit);
    if (users.length === 0) {
        return res.status(404).json({ msg: 'No users found' });
    }
    return res.json({ users });
});
exports.searcher = searcher;
//# sourceMappingURL=searcher.js.map