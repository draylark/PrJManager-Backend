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
const userSchema_1 = __importDefault(require("../models/userSchema"));
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getFriends = getFriends;
const getFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getFriend = getFriend;
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield userSchema_1.default.findByIdAndUpdate(userId, { $push: { friendsRequests: req.body.uid } }, { new: true });
        return res.json({
            msg: 'Friend request sent',
            user
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
    const { requestStatus, uid: myUserId } = req.body;
    const { userId } = req.params;
    if (requestStatus === 'accepted') {
        try {
            yield userSchema_1.default.findByIdAndUpdate(myUserId, { $pull: { friendsRequests: userId } }, { new: true });
            yield userSchema_1.default.findByIdAndUpdate(myUserId, { $push: { friends: userId } }, { new: true });
            const user = yield userSchema_1.default.findByIdAndUpdate(userId, { $push: { friends: myUserId } }, { new: true });
            return res.json({
                msg: `Friend request accepted`,
                user
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
        yield userSchema_1.default.findByIdAndUpdate(myUserId, { $pull: { friendsRequests: userId } }, { new: true });
        return res.json({
            msg: `Friend request rejected`
        });
    }
});
exports.manageFriendsRequests = manageFriendsRequests;
const deleteFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.deleteFriend = deleteFriend;
//# sourceMappingURL=friends.js.map