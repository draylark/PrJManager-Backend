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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsers = exports.putUsers = exports.getUsersById = exports.getUsers = exports.findUsers = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const findUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    try {
        let queryConditions = [{ username: { $regex: search, $options: 'i' } }];
        // Intentar agregar la condición de búsqueda por ID si 'search' es un ID válido
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            queryConditions.push({ _id: search });
        }
        const users = yield userSchema_1.default.find({ $or: queryConditions });
        // Asumiendo que quieres enviar los usuarios encontrados como respuesta
        res.json({
            users
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al buscar usuarios'
        });
    }
});
exports.findUsers = findUsers;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 4, from = 0 } = req.query;
    const { IDS } = req.body; // Asume que 'IDS' es un arreglo de IDs de usuario
    try {
        const users = yield userSchema_1.default.find({
            '_id': { $in: IDS },
            'state': true // Asumiendo que quieres seguir filtrando por el estado si es necesario
        })
            .skip(Number(from)) // Asegúrate de convertir 'from' y 'limit' a números
            .limit(Number(limit))
            .select('photoUrl _id username'); // Solo incluye 'photoUrl', '_id', y 'username'
        // Como el total específico de usuarios devueltos ya está definido por la longitud de 'users', no es necesario contarlos por separado
        const total = users.length;
        res.json({
            msg: 'get API - controller modified',
            total,
            users
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al obtener los usuarios'
        });
    }
});
exports.getUsers = getUsers;
const getUsersById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield userSchema_1.default.findOne({ _id: id });
        if (!user)
            return res.status(400).json({
                msg: 'User not found'
            });
        res.json({
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error1'
        });
    }
});
exports.getUsersById = getUsersById;
const putUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const _a = req.body, { _id, password, google } = _a, resto = __rest(_a, ["_id", "password", "google"]);
    try {
        if (password) {
            const salt = bcryptjs_1.default.genSaltSync(10);
            resto.password = bcryptjs_1.default.hashSync(password, salt);
        }
        const user = yield userSchema_1.default.findByIdAndUpdate(id, resto);
        res.json({
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error2',
            error
        });
    }
});
exports.putUsers = putUsers;
const deleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { authenticatedUser } = req;
    const user = yield userSchema_1.default.findByIdAndUpdate(id, { state: false });
    return res.json({
        user,
        authenticatedUser
    });
});
exports.deleteUsers = deleteUsers;
//# sourceMappingURL=users.js.map