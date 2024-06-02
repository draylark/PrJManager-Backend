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
exports.getFollowersLength = exports.getFriends = exports.getFollowing = exports.getFollowers = exports.getProfileFollowersFollowing = exports.getFollowersAndFollowingFriends = exports.getUsersRelation = exports.unfollowProfile = exports.followProfile = exports.getProjectTimelineActivity = exports.getTimelineActivity = exports.getMyMonthlyActivity = exports.updateMyLinks = exports.deleteUsers = exports.updateUserTopProjects = exports.putUsers = exports.getProfile = exports.getUsersById = exports.getUsers = exports.findUsers = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const friendshipSchema_1 = __importDefault(require("../models/friendshipSchema"));
const notisSchema_1 = __importDefault(require("../models/notisSchema"));
const followerSchema_1 = __importDefault(require("../models/followerSchema"));
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
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const user = yield userSchema_1.default.findById(uid)
            .select('username _id photoUrl website github twitter linkedin description createdAt followers');
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
    ;
});
exports.getProfile = getProfile;
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
const updateUserTopProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { currentTopProjects: topProjects } = req.body;
    try {
        const user = yield userSchema_1.default.findByIdAndUpdate(uid, { topProjects }, { new: true })
            .populate({
            path: 'topProjects',
            select: '_id name'
        });
        res.json({
            response: 'Top projects updated successfully!',
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error3',
            error
        });
    }
});
exports.updateUserTopProjects = updateUserTopProjects;
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
const updateMyLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { website, github, twitter, linkedin } = req.body;
    try {
        const user = yield userSchema_1.default.findByIdAndUpdate(uid, { website, github, twitter, linkedin }, { new: true });
        res.json({
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server Error4',
            error
        });
    }
});
exports.updateMyLinks = updateMyLinks;
const getMyMonthlyActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectsLength, commitsLength, completedTasksLength } = req;
    return res.json({
        projectsLength,
        commitsLength,
        completedTasksLength
    });
});
exports.getMyMonthlyActivity = getMyMonthlyActivity;
const getTimelineActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { allEvents } = req;
    try {
        res.json(allEvents);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});
exports.getTimelineActivity = getTimelineActivity;
const getProjectTimelineActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { allEvents } = req;
    try {
        res.json(allEvents);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});
exports.getProjectTimelineActivity = getProjectTimelineActivity;
const followProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileUID, uid, photoUrl, username } = req.body;
    try {
        // Agregar seguimiento
        const follower = yield followerSchema_1.default.create({
            uid: profileUID,
            followerId: uid
        });
        const populatedFollower = yield followerSchema_1.default.findById(follower._id)
            .select('uid')
            .populate('uid', 'username photoUrl _id');
        // Verificar si hay un seguimiento mutuo
        const mutualFollow = yield followerSchema_1.default.findOne({
            uid: uid,
            followerId: profileUID
        });
        yield userSchema_1.default.findByIdAndUpdate(profileUID, {
            $inc: { followers: 1 }
        });
        if (mutualFollow) {
            // Crear documento de amistad
            yield followerSchema_1.default.updateOne({ uid: profileUID, followerId: uid }, { mutualFollow: true });
            yield followerSchema_1.default.updateOne({ uid, followerId: profileUID }, { mutualFollow: true });
            const friendship = yield friendshipSchema_1.default.create({ ids: [profileUID, uid] });
            const noti = new notisSchema_1.default({
                type: 'new-follower',
                title: 'New Follower',
                description: `You have a new follower`,
                recipient: profileUID,
                from: {
                    ID: uid,
                    name: username,
                    photoUrl: photoUrl || null
                }
            });
            yield noti.save();
            const populatedFriendship = yield friendshipSchema_1.default.findById(friendship._id).populate('ids');
            return res.json({
                followedProfile: populatedFollower,
                friendship: populatedFriendship,
                type: 'friendship',
                success: true,
                message: 'Profile followed successfully'
            });
        }
        ;
        const noti = new notisSchema_1.default({
            type: 'new-follower',
            title: 'New Follower',
            description: `You have a new follower`,
            recipient: profileUID,
            from: {
                ID: uid,
                name: username,
                photoUrl: photoUrl || null
            }
        });
        yield noti.save();
        res.json({
            followedProfile: populatedFollower,
            friendship: null,
            type: 'follower',
            success: true,
            message: 'Profile followed successfully'
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});
exports.followProfile = followProfile;
const unfollowProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileUID } = req.params;
    const { uid } = req.query;
    try {
        // Eliminar seguimiento
        yield followerSchema_1.default.findOneAndDelete({
            uid: profileUID,
            followerId: uid
        });
        const friendshipRef = yield friendshipSchema_1.default.findOne({
            ids: { $all: [profileUID, uid] },
            active: true
        })
            .select('_id');
        const friendship = yield friendshipSchema_1.default.findOneAndDelete({
            ids: { $all: [profileUID, uid] },
            active: true
        });
        yield userSchema_1.default.findByIdAndUpdate(profileUID, {
            $inc: { followers: -1 }
        });
        yield userSchema_1.default.findByIdAndUpdate(uid, {
            $inc: { following: -1 }
        });
        if (friendship) {
            yield followerSchema_1.default.updateOne({ uid, followerId: profileUID }, { mutualFollow: false });
            yield userSchema_1.default.findByIdAndUpdate(uid, {
                $inc: { friends: -1 }
            });
            yield userSchema_1.default.findByIdAndUpdate(profileUID, {
                $inc: { friends: -1 }
            });
            return res.json({
                friendshipRef: friendshipRef._id,
                type: 'friendship',
                success: true,
                message: 'Profile unfollowed successfully'
            });
        }
        res.json({
            friendshipRef: null,
            type: 'follower',
            success: true,
            message: 'Profile unfollowed successfully'
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});
exports.unfollowProfile = unfollowProfile;
const getUsersRelation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, profileUID } = req.query;
    try {
        const followsMe = yield followerSchema_1.default.findOne({ uid: uid, followerId: profileUID });
        const iFollow = yield followerSchema_1.default.findOne({ uid: profileUID, followerId: uid });
        const friendship = yield friendshipSchema_1.default.findOne({
            ids: { $all: [profileUID, uid] },
            active: true
        });
        res.json({
            followsMe: !!followsMe,
            iFollow: !!iFollow,
            friendship: !!friendship
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getUsersRelation = getUsersRelation;
const getFollowersAndFollowingFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { limit = 15 } = req.query;
    try {
        const followers = yield followerSchema_1.default.find({ uid })
            .select('followerId mutualFollow')
            .populate('followerId', 'username photoUrl')
            .limit(Number(limit));
        const following = yield followerSchema_1.default.find({ followerId: uid })
            .select('uid mutualFollow')
            .populate('uid', 'username photoUrl')
            .limit(Number(limit));
        const friends = yield friendshipSchema_1.default.find({
            ids: uid,
            active: true
        })
            .populate('ids', 'username photoUrl')
            .limit(Number(limit));
        const followersCount = yield followerSchema_1.default.countDocuments({ uid });
        const followingCount = yield followerSchema_1.default.countDocuments({ followerId: uid });
        const friendsCount = yield friendshipSchema_1.default.countDocuments({
            ids: uid,
            active: true
        });
        res.json({
            followers,
            following,
            friends,
            followersLength: followersCount,
            followingLength: followingCount,
            friendsLength: friendsCount,
            totalFollowersPages: Math.ceil(followersCount / Number(limit)),
            totalFollowingPages: Math.ceil(followingCount / Number(limit)),
            totalFriendsPages: Math.ceil(friendsCount / Number(limit))
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getFollowersAndFollowingFriends = getFollowersAndFollowingFriends;
const getProfileFollowersFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileUID } = req.params;
    const { limit = 15 } = req.query;
    try {
        const followers = yield followerSchema_1.default.find({ uid: profileUID })
            .select('followerId')
            .populate('followerId', 'username photoUrl')
            .limit(Number(limit));
        const following = yield followerSchema_1.default.find({ followerId: profileUID })
            .select('uid')
            .populate('uid', 'username photoUrl')
            .limit(Number(limit));
        const followersCount = yield followerSchema_1.default.countDocuments({ uid: profileUID });
        const followingCount = yield followerSchema_1.default.countDocuments({ followerId: profileUID });
        res.json({
            followers,
            following,
            followersLength: followersCount,
            followingLength: followingCount,
            totalFollowersPages: Math.ceil(followersCount / Number(limit)),
            totalFollowingPages: Math.ceil(followingCount / Number(limit)),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getProfileFollowersFollowing = getProfileFollowersFollowing;
const getFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileUID } = req.params;
    const { limit = 15, page } = req.query;
    try {
        const followers = yield followerSchema_1.default.find({ uid: profileUID })
            .select('followerId mutualFollow')
            .populate('followerId', 'username photoUrl')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        // Verificar que siguen devuelta
        res.json({
            followers,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getFollowers = getFollowers;
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileUID } = req.params;
    const { limit = 15, page } = req.query;
    try {
        const following = yield followerSchema_1.default.find({ followerId: profileUID })
            .select('uid')
            .populate('uid', 'username photoUrl')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        res.json({
            following,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getFollowing = getFollowing;
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { limit = 15, page } = req.query;
    try {
        const friends = yield friendshipSchema_1.default.find({ ids: uid, active: true })
            .populate('ids', 'username photoUrl')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        res.json({
            friends,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getFriends = getFriends;
const getFollowersLength = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const followers = yield followerSchema_1.default.find({ uid });
        res.json({
            followersLength: followers.length
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
});
exports.getFollowersLength = getFollowersLength;
//# sourceMappingURL=users.js.map