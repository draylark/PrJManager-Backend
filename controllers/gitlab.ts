import * as express from 'express'
import axios from 'axios';
import Layer from '../models/layerSchema';
import Project from '../models/projectSchema';
import Repo from '../models/repoSchema';
import User from '../models/userSchema';
import archiver from 'archiver';
import path from 'path';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import unzipper from 'unzipper';
import { promisify } from 'util';
const execAsync = promisify(require('child_process').exec);
import { generateShortenedUUID } from '../helpers/generateuuids';

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



export const getAllGroups = async (req: express.Request, res: express.Response) => {

  const { userId } = req.params;

  try {
    const layers = await Layer.find({ owner: userId });
    res.json({ layers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving groups' });
  }
};



export const createGroup = async ( req: express.Request, res: express.Response ) => {

  const { name, description, visibility, parent_id, project, creator } = req.body;

  try {

      const gitlabAccessToken = process.env.IDK
      const permanentVsibility = 'private'

      const path = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const response = await axios.post('https://gitlab.com/api/v4/groups', {
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

      const layer = response.data

      const newLayer = new Layer({
        name: name,
        path: layer.path,
        description: description,
        visibility,
        project,
        creator,
        gitlabId: layer.id
      })

      await newLayer.save()

      const updatedProject = await Project.findByIdAndUpdate(
        project,
        { $inc: { layers: 1 } }, // Incrementa el contador de 'layers' en 1
        { new: true }
      );


      res.json({ 
        newLayer,
        updatedProject,
      });

  } catch (error) {
      console.log(error.response ? error.response.data : error.message);
      res.json({ message: error.message });
  }
}



export const createRepo = async (req: express.Request, res: express.Response) => {
  
  const { name, description, visibility, gitlabId, layer, project, branches, defaultBranch, creator } = req.body;

  try {

    const permanentVsibility = 'private'
    const accessToken = 'glpat-ZBBtQb_tKQNBrYqRXAmi';
    const gitlabAccessToken = process.env.GITLAB_ACCESS_TOKEN

    // Crear el repositorio en GitLab
    const response = await axios.post(`https://gitlab.com/api/v4/projects`, {
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
    const newRepo = new Repo({
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

    await newRepo.save();

    const updatedProject = await Project.findByIdAndUpdate(
      project,
      { $inc: { repositories: 1 } },
      { new: true }
    );


    res.json({
      newRepo,
      updatedProject,
    });
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message });
  }
};



export const updateLayer = async (req: express.Request, res: express.Response) => {

  const { layerId } = req.params;
  const { name, description, visibility, parent_Id, owner } = req.body;

  // if(!layerId) res.status(400).json({ 
  //   message: 'No se encontró el grupo' 
  // });

  const layer = await Layer.findByIdAndUpdate(layerId, { name, description, visibility }, { new: true });

  // if(!layer) res.status(400).json({ 
  //   message: 'No se encontró el grupo' 
  // });

  layer?.save()

  res.status(200).json({
    msg: 'Layer Updated',
    layer
  })


}



export const loadRepoFiles = async (req: express.Request, res: express.Response) => {
  const { branch } = req.params
  console.log('branch en el loadrepofiles',branch)
  const { repoGitlabID } = req; // Asegúrate de obtener correctamente el ID
  console.log(repoGitlabID)

  if (!repoGitlabID) {
    return res.status(400).json({ message: 'Repository not found.' });
  }

  try {
    const response = await axios.get(`https://gitlab.com/api/v4/projects/${repoGitlabID}/repository/tree?ref=${branch}`, {
      headers: {
        'PRIVATE-TOKEN': process.env.GITLAB_READ_REPOS,
      },
    });

    // Si la respuesta es exitosa pero no hay archivos, retorna una respuesta adecuada
    if (response.data.length === 0) {
      return res.status(200).json({ message: 'No repository files found.', files: [] });
    }

    res.status(200).json({ files: response.data, branch });
  } catch (error) {
    // Ajusta según el tipo de error específico de GitLab para un repositorio vacío
    if (error.response && error.response.status === 404) {
      return res.json({ message: 'No repository files found.', files: [] });
    }

    console.log(error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error while fetching repository files.' });
  }
};




export const loadContentFile = async (req: express.Request, res: express.Response) => {
  const { repoGitlabID } = req;
  const { filePath, branch } = req.query

  console.log('branch en el backend',branch)
  if (!repoGitlabID) {
    return res.status(400).json({ 
      message: 'No se encontró el repositorio' 
    });
  }

  try {
    const response = await axios.get(`https://gitlab.com/api/v4/projects/${repoGitlabID}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${encodeURIComponent(branch)}`, {
      headers: {
        'PRIVATE-TOKEN': process.env.GITLAB_READ_REPOS,
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

  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message });
  }
};


export const loadFolderContents = async (req: express.Request, res: express.Response) => {
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

    const response = await axios.get(url, {
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

  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message });
  }
};

