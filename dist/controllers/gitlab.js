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
exports.diffCommits = exports.loadFolderContents = exports.loadContentFile = exports.loadRepoFiles = exports.updateLayer = exports.createRepo = exports.createGroup = exports.getAllGroups = void 0;
const axios_1 = __importDefault(require("axios"));
const layerSchema_1 = __importDefault(require("../models/layerSchema"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const repoSchema_1 = __importDefault(require("../models/repoSchema"));
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
    const { name, description, visibility, parent_id, project, creator } = req.body;
    try {
        const gitlabAccessToken = process.env.IDK;
        const permanentVsibility = 'private';
        const path = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const response = yield axios_1.default.post('https://gitlab.com/api/v4/groups', {
            name,
            path,
            description,
            permanentVsibility,
            parent_id,
        }, {
            headers: {
                'Authorization': `Bearer ${gitlabAccessToken}`,
            },
        });
        const layer = response.data;
        const newLayer = new layerSchema_1.default({
            name: name,
            path: layer.path,
            description: description,
            visibility,
            project,
            creator,
            gitlabId: layer.id
        });
        yield newLayer.save();
        const updatedProject = yield projectSchema_1.default.findByIdAndUpdate(project, { $inc: { layers: 1 } }, // Incrementa el contador de 'layers' en 1
        { new: true });
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
    const { name, description, visibility, gitlabId, layer, project, branches, defaultBranch, creator } = req.body;
    try {
        const permanentVsibility = 'private';
        const accessToken = 'glpat-ZBBtQb_tKQNBrYqRXAmi';
        const gitlabAccessToken = process.env.GITLAB_ACCESS_TOKEN;
        // Crear el repositorio en GitLab
        const response = yield axios_1.default.post(`https://gitlab.com/api/v4/projects`, {
            name,
            description,
            permanentVsibility,
            namespace_id: gitlabId, // ID del grupo donde se creará el repositorio
        }, {
            headers: {
                'Authorization': `Bearer ${gitlabAccessToken}`,
            },
        });
        const repo = response.data;
        // Guardar el repositorio en la base de datos
        const newRepo = new repoSchema_1.default({
            name,
            description,
            visibility,
            projectID: project,
            layerID: layer,
            gitlabId: repo.id,
            gitUrl: repo.http_url_to_repo,
            webUrl: repo.web_url,
            branches,
            defaultBranch,
            creator
        });
        yield newRepo.save();
        const updatedProject = yield projectSchema_1.default.findByIdAndUpdate(project, { $inc: { repositories: 1 } }, { new: true });
        res.json({
            newRepo,
            updatedProject,
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
    const { branch } = req.params;
    const { repoGitlabID } = req; // Asegúrate de obtener correctamente el ID
    if (!repoGitlabID) {
        return res.status(400).json({ message: 'Repository not found.' });
    }
    try {
        const response = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${repoGitlabID}/repository/tree?ref=${branch}`, {
            headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_ACCESS_TOKEN,
            },
        });
        // Si la respuesta es exitosa pero no hay archivos, retorna una respuesta adecuada
        if (response.data.length === 0) {
            return res.status(200).json({ message: 'No repository files found.', files: [] });
        }
        res.status(200).json({ files: response.data, branch });
    }
    catch (error) {
        if (error.response && error.response.status === 404) {
            return res.json({ message: 'No repository files found.', files: [] });
        }
        console.log(error.response ? error.response.data : error.message);
        return res.status(500).json({ message: error.response ? error.response.data : error.message || 'Error loading repository files.' });
    }
});
exports.loadRepoFiles = loadRepoFiles;
const loadContentFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoGitlabID } = req;
    const { filePath, branch } = req.query;
    console.log('branch en el backend', branch);
    if (!repoGitlabID) {
        return res.status(400).json({
            message: 'No se encontró el repositorio'
        });
    }
    try {
        const response = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${repoGitlabID}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${encodeURIComponent(branch)}`, {
            headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_ACCESS_TOKEN,
            },
            responseType: 'text' // Asegúrate de que la respuesta se trata como texto
        });
        // console.log(response)
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
    const { repoGitlabID } = req;
    const { folderPath } = req.query; // Ruta de la carpeta
    if (!repoGitlabID) {
        return res.status(400).json({
            message: 'No se encontró el repositorio'
        });
    }
    try {
        // Añade el parámetro `path` a la URL si `folderPath` está presente
        const folderQuery = folderPath ? `&path=${encodeURIComponent(folderPath)}` : '';
        const url = `https://gitlab.com/api/v4/projects/${repoGitlabID}/repository/tree?ref=main${folderQuery}`;
        const response = yield axios_1.default.get(url, {
            headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_READ_REPOS,
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
const diffCommits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hash1, hash2, gitlabId } = req;
    const { uuid1, uuid2 } = req.query;
    if (!gitlabId) {
        return res.status(400).json({ message: 'Repository not found.' });
    }
    try {
        if (hash2 === null) {
            console.log('Solo hay un hash');
            const commit1FilesResponse = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlabId)}/repository/commits/${hash1}/diff`, {
                headers: {
                    'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
                },
            });
            const commit1Files = commit1FilesResponse.data;
            return res.status(200).json({
                type: 'one-diff',
                commit1: { hash: uuid1 || uuid1, diffs: commit1Files, additionalData: commit1FilesResponse.data },
                commit2: null
            });
        }
        else {
            const response = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlabId)}/repository/compare?from=${hash1}&to=${hash2}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
                },
            });
            console.log('Respuesta comparativa', response);
            const diffData = response.data;
            // Verifica si el diff está vacío
            if (diffData.diffs.length === 0) {
                console.log('No hay coincidencia');
                // Si el diff está vacío, recupera el contenido de los archivos de ambos commits
                const commit1FilesResponse = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlabId)}/repository/commits/${hash1}/diff`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
                    },
                });
                const commit2FilesResponse = yield axios_1.default.get(`https://gitlab.com/api/v4/projects/${encodeURIComponent(gitlabId)}/repository/commits/${hash2}/diff`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
                    },
                });
                const commit1Files = commit1FilesResponse.data;
                const commit2Files = commit2FilesResponse.data;
                // Devuelve el contenido de los archivos junto con cualquier otra información relevante
                return res.status(200).json({
                    type: 'no-diff',
                    message: 'No differences detected, returning file contents for comparison.',
                    commit1: { hash: uuid1, diffs: commit1Files },
                    commit2: { hash: uuid2, diffs: commit2Files }
                });
            }
            console.log('Hubo coincidencia');
            // Si hay diferencias, devuelve la respuesta de la comparación de commits normalmente
            res.status(200).json({ type: 'diff', uuid1, uuid2, diffData });
        }
    }
    catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});
exports.diffCommits = diffCommits;
//# sourceMappingURL=gitlab.js.map