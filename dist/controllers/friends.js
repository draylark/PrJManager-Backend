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
exports.deleteFriend = exports.handleFriendRequest = exports.newFriendRequest = exports.getFriend = exports.getFriends = void 0;
const friendSchema_1 = __importDefault(require("../models/friendSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const friendshipSchema_1 = __importDefault(require("../models/friendshipSchema"));
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
const newFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestedUID } = req.params;
    const { uid, username, photoUrl } = req.body;
    try {
        const friendship = new friendshipSchema_1.default({
            requester: uid,
            recipient: requestedUID,
            status: 'pending'
        });
        yield friendship.save();
        const noti = new notisSchema_1.default({
            type: 'friend-request',
            title: 'Friend request',
            description: `You have a new friend request`,
            recipient: requestedUID,
            from: {
                ID: uid,
                name: username,
                photoUrl: photoUrl || null
            },
            additionalData: {
                ref: friendship._id
            },
        });
        yield noti.save();
        return res.json({
            message: 'Friend request sent',
            success: true
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.newFriendRequest = newFriendRequest;
const handleFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestStatus, uid, notiID, ref } = req.body;
    const { requesterID } = req.params;
    try {
        if (requestStatus === 'accept') {
            yield friendshipSchema_1.default.findOneAndUpdate({ _id: ref, requester: requesterID, recipient: uid, status: 'pending' }, { status: 'accepted' });
            yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
            return res.json({
                accepted: true,
                message: `Friend request accepted.`,
            });
        }
        else {
            yield friendshipSchema_1.default.findOneAndUpdate({ _id: ref, requester: requesterID, recipient: uid, status: 'pending' }, { status: 'rejected' });
            yield notisSchema_1.default.findByIdAndUpdate(notiID, { status: false });
            res.json({
                accepted: false,
                message: `Friend request rejected.`,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
});
exports.handleFriendRequest = handleFriendRequest;
const deleteFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.deleteFriend = deleteFriend;
//# sourceMappingURL=friends.js.map