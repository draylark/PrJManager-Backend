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
exports.getClient = exports.postClient = void 0;
const clientSchema_1 = __importDefault(require("../models/clientSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const postClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = new clientSchema_1.default(req.body);
        yield client.save();
        const updatedUser = yield userSchema_1.default.findByIdAndUpdate(req.uid, { $push: { clients: client._id } }, { new: true });
        res.json({
            msg: 'Client created',
            updatedUser,
            client
        });
    }
    catch (error) {
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
});
exports.postClient = postClient;
const getClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId)
        return res.status(400).json({
            msg: 'User id is required'
        });
    const user = yield userSchema_1.default.findById(userId).populate('clients').select('clients');
    if (!user)
        return res.status(400).json({
            msg: 'User not found'
        });
    const clients = user.toObject();
    clients.clients = clients.clients.map(client => {
        const { __v, _id } = client, clientData = __rest(client, ["__v", "_id"]);
        return Object.assign(Object.assign({}, clientData), { cid: _id });
    });
    res.json({
        clients
    });
});
exports.getClient = getClient;
//# sourceMappingURL=clients.js.map