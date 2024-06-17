"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gitController = __importStar(require("../controllers/gitlab"));
const DB_validators_1 = require("../middlewares/others/DB-validators");
const validateJWT_1 = require("../middlewares/auth/validateJWT");
const multer_1 = __importDefault(require("multer"));
const commits_middlewares_1 = require("../middlewares/commit/commits-middlewares");
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = express_1.default.Router();
router.get('/get-layers/:userId', gitController.getAllGroups);
router.get('/loadRepoFiles/:repoID/:branch', [validateJWT_1.validateJWT, DB_validators_1.validateRepositoryExistance], gitController.loadRepoFiles);
router.get('/loadContentFile/:repoID', [validateJWT_1.validateJWT, DB_validators_1.validateRepositoryExistance], gitController.loadContentFile);
router.get('/loadFolderContents/:repoID', [validateJWT_1.validateJWT, DB_validators_1.validateRepositoryExistance], gitController.loadFolderContents);
router.get('/diff/:uuid1?/:uuid2?', [commits_middlewares_1.getCommitsHashes], gitController.diffCommits);
router.post('/create-group', gitController.createGroup);
router.post('/create-repo', gitController.createRepo);
router.post('/update-layer/:layerId', gitController.updateLayer);
exports.default = router;
//# sourceMappingURL=gitlabR.js.map