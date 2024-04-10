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
exports.deleteFriend = exports.manageFriendsRequests = exports.addFriend = exports.getFriend = exports.getFriends = void 0;
const friendSchema_1 = __importDefault(require("../models/friendSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        // Encuentra documentos donde el arreglo `friends_reference` contenga el `uid`
        // y el estado sea `true`.
        const coincidences = yield friendSchema_1.default.find({
            friends_reference: { $in: [uid] },
            state: true
        });
        // Filtra y extrae los IDs de los amigos, excluyendo el `uid` del usuario que hace la solicitud.
        const friends = coincidences.map(f => f.friends_reference.find(id => id.toString() !== uid) // Encuentra el primer id que no sea el `uid`.
        ).filter(id => id !== undefined); // Filtra cualquier resultado undefined por si acaso.
        // Devuelve solo los IDs de los amigos.
        return res.json(friends);
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        });
    }
});
exports.getFriends = getFriends;
const getFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getFriend = getFriend;
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestedUID } = req.params;
    const { uid, username, photoUrl } = req.body;
    try {
        const f = new friendSchema_1.default({
            friends_reference: [requestedUID, uid],
            requester: uid,
            recipient: requestedUID,
        });
        f.save();
        const noti = new notisSchema_1.default({
            type: 'friend-request',
            title: 'Friend request',
            description: `You have a new friend request`,
            from: {
                ID: uid,
                name: username,
                photoUrl: photoUrl || null
            },
            recipient: requestedUID,
            state: false
        });
        noti.save();
        return res.json({
            msg: 'Friend request sent',
            noti,
            f
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        });
    }
});
exports.addFriend = addFriend;
const manageFriendsRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestStatus, uid, notiID } = req.body;
    const { requesterID } = req.params;
    if (requestStatus === 'accept') {
        try {
            const f = yield friendSchema_1.default.findOneAndUpdate({ requester: requesterID, recipient: uid }, { friendship_status: 'accepted', state: true }, { new: true });
            const noti = yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false }, { new: true });
            return res.json({
                msg: `Friend request accepted`,
                new_friend: f,
                notiTodelete: noti === null || noti === void 0 ? void 0 : noti._id
            });
        }
        catch (error) {
            return res.status(500).json({
                msg: 'Server error',
                error: error.message
            });
        }
    }
    else {
        try {
            const f = yield friendSchema_1.default.findOneAndRemove({ requester: requesterID, recipient: uid });
            const noti = yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false }, { new: true });
            res.json({
                msg: `Friend request rejected`,
                notiTodelete: noti === null || noti === void 0 ? void 0 : noti._id
            });
        }
        catch (error) {
            return res.status(400).json({
                msg: 'Bad request'
            });
        }
    }
});
exports.manageFriendsRequests = manageFriendsRequests;
const deleteFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.deleteFriend = deleteFriend;
//# sourceMappingURL=friends.js.map