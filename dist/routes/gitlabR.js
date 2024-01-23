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
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = express_1.default.Router();
// router.get('/auth', gitController.callback );
// router.get('/access-token', (req, res) => { 
//     const accessToken = req.cookies['gitlabToken'];
//     if (accessToken) {
//         res.json({ token: accessToken });
//     } else {
//       res.status(400).send('No se encontró el token de acceso');
//     }
// } )
router.get('/get-layers/:userId', gitController.getAllGroups);
router.get('/loadRepoFiles/:repoId', gitController.loadRepoFiles);
router.get('/loadContentFile/:repoId', gitController.loadContentFile);
router.get('/loadFolderContents/:repoId', gitController.loadFolderContents);
router.post('/create-group', gitController.createGroup);
router.post('/create-repo', gitController.createRepo);
router.post('/update-layer/:layerId', gitController.updateLayer);
router.post('/requestAccess', upload.single('file'), gitController.requestAccess);
exports.default = router;
//# sourceMappingURL=gitlabR.js.map