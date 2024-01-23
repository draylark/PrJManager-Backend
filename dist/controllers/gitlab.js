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
exports.requestAccess = exports.loadFolderContents = exports.loadContentFile = exports.loadRepoFiles = exports.updateLayer = exports.createRepo = exports.createGroup = exports.getAllGroups = void 0;
const axios_1 = __importDefault(require("axios"));
const layerSchema_1 = __importDefault(require("../models/layerSchema"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const unzipper_1 = __importDefault(require("unzipper"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(require('child_process').exec);
// export const callback = async (req: express.Request, res: express.Response) => {
//     const code = req.query.code;
//     if (!code) {
//       return res.status(400).send('Código de autorización no proporcionado');
//     }
//     try {
//       console.log('code', code);
//       const response = await axios.post('https://gitlab.com/oauth/token', {
//         client_id: process.env.GITLAB_CLIENT_ID, // Utiliza variables de entorno para proteger tus claves
//         client_secret: process.env.GITLAB_CLIENT_SECRET,
//         code,
//         grant_type: 'authorization_code',
//         redirect_uri: process.env.GITLAB_REDIRECT_URI, // el de aquí debe coincidir con el de GitLab
//       });
//       const accessToken = response.data.access_token;
//       // Aquí puedes utilizar el token de acceso para obtener información del usuario o hacer otras operaciones en GitLab
//       // ...
//       res.cookie('gitlabToken', accessToken, { httpOnly: true, secure: true,  maxAge: 2 * 60 * 60 * 1000 });
//       res.redirect(`${process.env.FRONTEND_URL}/user/projects?gitlab=true`);
//     } catch (error) {
//       console.log(error.response ? error.response.data : error.message);
//       res.status(500).send('Error durante la autenticación');
//     }
// };
const getAllGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const layers = yield layerSchema_1.default.find({ owner: userId });
        res.json({ layers });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error retrieving groups' });
    }
});
exports.getAllGroups = getAllGroups;
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, visibility, parent_id, project, owner } = req.body;
    try {
        const permanentVsibility = 'private';
        const accessToken = 'glpat-X3s1aC81HzFbbUNgsyyg';
        const path = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const response = yield axios_1.default.post('https://gitlab.com/api/v4/groups', {
            name,
            path,
            description,
            permanentVsibility,
            parent_id,
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const layer = response.data;
        const newLayer = new layerSchema_1.default({
            name: layer.name,
            path: layer.path,
            description: layer.description,
            visibility,
            project,
            owner,
            members: layer.members,
            gitlabId: layer.id
        });
        yield newLayer.save();
        const updatedProject = yield projectSchema_1.default.findByIdAndUpdate(project, { $push: { layers: newLayer._id } }, { new: true });
        res.json({
            newLayer,
            updatedProject,
        });
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.json({ message: error.message });
    }
});
exports.createGroup = createGroup;
const createRepo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, visibility, gitlabId, layer, userId, project } = req.body;
    try {
        const permanentVsibility = 'private';
        const accessToken = 'glpat-X3s1aC81HzFbbUNgsyyg';
        // Crear el repositorio en GitLab
        const response = yield axios_1.default.post(`https://gitlab.com/api/v4/projects`, {
            name,
            description,
            permanentVsibility,
            namespace_id: gitlabId, // ID del grupo donde se creará el repositorio
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const repo = response.data;
        // Guardar el repositorio en la base de datos
        const newRepo = new repoSchema_1.default({
            name: repo.name,
            description: repo.description,
            visibility,
            project,
            layer,
            gitlabId: repo.id,
            owner: userId,
            gitUrl: repo.http_url_to_repo,
            webUrl: repo.web_url,
        });
        yield newRepo.save();
        // Actualizar el grupo con el nuevo repositorio
        const updatedLayer = yield layerSchema_1.default.findByIdAndUpdate(layer, { $push: { repos: newRepo._id } }, { new: true });
        res.json({
            newRepo,
            updatedLayer
        });
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.createRepo = createRepo;
const updateLayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { layerId } = req.params;
    const { name, description, visibility, parent_Id, owner } = req.body;
    // if(!layerId) res.status(400).json({ 
    //   message: 'No se encontró el grupo' 
    // });
    const layer = yield layerSchema_1.default.findByIdAndUpdate(layerId, { name, description, visibility }, { new: true });
    // if(!layer) res.status(400).json({ 
    //   message: 'No se encontró el grupo' 
    // });
    layer === null || layer === void 0 ? void 0 : layer.save();
    res.status(200).json({
        msg: 'Layer Updated',
        layer
    });
});
exports.updateLayer = updateLayer;
const loadRepoFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoId } = req.params;
    if (!repoId)
        res.status(400).json({
            message: 'No se encontró el repositorio'
        });
    try {
        const response = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${repoId}/repository/tree`, {
            headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_ACCESS_TOKEN,
            },
        });
        if (response.data.length === 0)
            res.status(400).json({
                message: 'No se encontraron archivos en el repositorio'
            });
        console.log(response.data);
        res.status(200).json({ files: response.data });
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.loadRepoFiles = loadRepoFiles;
const loadContentFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoId } = req.params;
    const { filePath } = req.query;
    console.log(filePath);
    if (!repoId) {
        return res.status(400).json({
            message: 'No se encontró el repositorio'
        });
    }
    try {
        const response = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${repoId}/repository/files/${encodeURIComponent(filePath)}/raw`, {
            headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_ACCESS_TOKEN,
            },
            responseType: 'text' // Asegúrate de que la respuesta se trata como texto
        });
        console.log(response);
        // Verifica si hay contenido antes de enviar
        if (response.data.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron archivos en el repositorio'
            });
        }
        // Envía solo el contenido del archivo como texto plano
        res.setHeader('Content-Type', 'text/plain');
        res.send(response.data);
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.loadContentFile = loadContentFile;
const loadFolderContents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoId } = req.params;
    const { folderPath } = req.query; // Ruta de la carpeta
    if (!repoId) {
        return res.status(400).json({
            message: 'No se encontró el repositorio'
        });
    }
    try {
        // Añade el parámetro `path` a la URL si `folderPath` está presente
        const folderQuery = folderPath ? `&path=${encodeURIComponent(folderPath)}` : '';
        const url = `https://gitlab.com/api/v4/projects/${repoId}/repository/tree?ref=main${folderQuery}`;
        const response = yield axios_1.default.get(url, {
            headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_ACCESS_TOKEN,
            },
        });
        if (response.data.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron archivos en la carpeta'
            });
        }
        res.status(200).json({ files: response.data });
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.loadFolderContents = loadFolderContents;
// export const requestAccess = async(req: express.Request, res: express.Response) => {
//   const { PAT, UID, remoteUrl, type } = req.body;
//   const user = await User.findOne({ _id: UID, personalAccessToken: PAT });
//   if(!user) return res.status(400).json({ 
//     message: 'No se encontró el usuario, o el token es invalido' 
//   });
//   switch (type) {
//     case 'push':
//       exec(`git push https://oauth2:${process.env.GITLAB_ACCESS_TOKEN}@gitlab.com/${remoteUrl}`, (err, stdout, stderr) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//         console.log(stdout);
//       });  
//       break;
//     case 'pull':
//       exec(`git pull https://gitlab.com/${remoteUrl}`, (err, stdout, stderr) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//         console.log(stdout);
//       });  
//       break;
//     case 'clone':
//       exec(`git clone https://gitlab.com/${remoteUrl}`, (err, stdout, stderr) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//         console.log(stdout);
//       });  
//       break;
//     default:
//       break;
//   }
// res.status(200).json({
//   access: process.env.GITLAB_ACCESS_TOKEN,
//   url: `https://oauth2:${process.env.GITLAB_ACCESS_TOKEN}@gitlab.com/`
// });
// };
const requestAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { PAT, UID, remoteUrl, type } = req.body;
    const file = req.file;
    const user = yield userSchema_1.default.findOne({ _id: UID, personalAccessToken: PAT });
    if (!user) {
        return res.status(400).json({ message: 'No se encontró el usuario' });
    }
    const repoName = remoteUrl.split('/').pop().replace('.git', ''); // Asegúrate de eliminar '.git' si está presente
    // const repoPath = `/path/to/repos/${repoName}`; // Define la ruta donde se descomprimirán los archivos
    const gitCommandUrl = `git push https://oauth2:${process.env.GITLAB_ACCESS_TOKEN}@gitlab.com/${remoteUrl} main`;
    console.log('filezip:', file);
    switch (type) {
        case 'push':
            if (!file) {
                return res.status(400).json({ message: 'Archivo zip no proporcionado' });
            }
            const reposPath = path_1.default.join(__dirname, '../..', 'repos');
            const repoPath = path_1.default.join(reposPath, repoName);
            if (!(0, fs_1.existsSync)(reposPath)) {
                (0, fs_1.mkdirSync)(reposPath, { recursive: true });
            }
            console.log('gitCommandUrl: :', gitCommandUrl);
            console.log('reposPath: ', reposPath);
            console.log('repoPath: ', repoPath);
            (0, fs_1.createReadStream)(file.path)
                .pipe(unzipper_1.default.Extract({ path: repoPath }))
                .on('close', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const { stdout, stderr } = yield execAsync(gitCommandUrl, { cwd: repoPath });
                    console.log('stdout:', stdout);
                    console.log('stderr:', stderr);
                    res.status(200).json({ message: 'Push realizado correctamente' });
                }
                catch (error) {
                    console.error('Error al ejecutar git push:', error);
                    res.status(500).json({ message: 'Error ejecutando comandos Git' });
                }
            }))
                .on('error', (err) => {
                console.error('Error al descomprimir el archivo:', err);
                res.status(500).json({ message: 'Error al descomprimir el archivo' });
            });
            break;
        case 'pull':
            const pullCommand = `git pull ${gitCommandUrl}`;
            exec(pullCommand, { cwd: repoPath }, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error ejecutando el comando Git pull' });
                }
                // Empaqueta los archivos y envíalos de vuelta
                const output = (0, fs_1.createWriteStream)(`${repoPath}.zip`);
                const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
                archive.pipe(output);
                archive.directory(repoPath, false);
                archive.finalize();
                output.on('close', () => {
                    return res.download(`${repoPath}.zip`);
                });
            });
            break;
        case 'clone':
            const cloneCommand = `git clone ${gitCommandUrl} ${repoPath}`;
            exec(cloneCommand, { cwd: '/path/to/repos' }, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error ejecutando el comando Git clone' });
                }
                // Empaqueta los archivos y envíalos de vuelta
                const output = (0, fs_1.createWriteStream)(`${repoPath}.zip`);
                const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
                archive.pipe(output);
                archive.directory(repoPath, false);
                archive.finalize();
                output.on('close', () => {
                    return res.download(`${repoPath}.zip`);
                });
            });
            break;
        default:
            res.status(400).json({ message: 'Tipo de operación no soportada' });
            break;
    }
});
exports.requestAccess = requestAccess;
//# sourceMappingURL=gitlab.js.map