import { Request, Response, NextFunction } from 'express';
import Collaborator from '../models/collaboratorSchema';
import Repo from '../models/repoSchema';
import axios from 'axios';



export const createRepoOnGitlab = async (req: Request, res: Response, next: NextFunction) => {
    const { gitlabGroupID } = req;
  
    try {
      const permanentVsibility = 'private';
      const accessToken = process.env.CREATE_REPOS
      
      // Generar un nombre de repositorio único
      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const repoName = `repo-${uniqueSuffix}`;
  
      // Crear el repositorio en GitLab
      const response = await axios.post(`https://gitlab.com/api/v4/projects`, {
        name: repoName,
        visibility: permanentVsibility,
        namespace_id: gitlabGroupID, // ID del grupo donde se creará el repositorio
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      console.log('Repositorio creado en Gitlab', response.data)
      req.repo = response.data;
      next();
  
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
      res.status(500).json({ message: error.message });
    }
}



export const createRepoOnMongoDB = async (req: Request, res: Response, next: NextFunction) => {

    const { name, visibility, description, projectID, layerID, uid } = req.body;
    const { repo } = req;

    try {
        
    const newRepo = new Repo({
      name,
      description: description,
      visibility,
      gitUrl: repo.http_url_to_repo,
      webUrl: repo.web_url, 
      projectID,
      layerID, 
      repoGitlabId: repo.id, 
      creator: uid,
    });

    await newRepo.save();

    console.log('Repositorio creado en MongoDB', newRepo)

    req.success = true
    req.repoID = newRepo._id;
    next();

    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
}



// ! Validation

export const validateRepositoryExistance = async (req: Request, res: Response, next: NextFunction) => {

  const { repoID } = req.params;

  try {
      const repo = await Repo.findById(repoID);

      if (!repoID) return res.status(404).json({
          message: 'Repository not found'
      });

      req.repo = repo;

      next();
  } catch (error) {
      console.log(error)
      console.log('error3')
      res.status(500).json({
          msg: 'Internal Server Error'
      });
  };

};
export const validateCollaboratorAccessOnRepository = ( minAccess ) => {
  return async ( req: Request, res: Response, next: NextFunction ) => {

      const { project } = req
      const { repoID } = req.params
      const uid = req.query.uid;

      if(  project.owner.toString() === uid ){
          return next()
      }

      const collaborator = await Collaborator.findOne({ uid, 'repository._id': repoID })

      if (!collaborator) {
          return res.status(400).json({
              message: 'You do not have access to this repository'
          })
      }

      if( !minAccess.includes( collaborator.repository.accessLevel ) ){
          return res.status(400).json({
              message: 'You do not have the required access level to perform this action'
          })
      }
      next()
  };
};

export const verifyTwoAccessLevelOfNewCollaborator = async (req: Request, res: Response, next: NextFunction) => {
  const { projectID, layerID } = req.params;
  const { newCollaborators } = req.body;

  if (newCollaborators.length === 0) {
    return next();
  }

  console.log('Nuevos colaboradores', newCollaborators);

  for (const collaborator of newCollaborators) {
    const { id, photoUrl, name } = collaborator;

    // Comprobar y actualizar o insertar para el proyecto
    const prjCollaborator = await Collaborator.findOne({ uid: id, projectID, 'project._id': projectID });
    if (prjCollaborator) {
      if (!prjCollaborator.state) {
        prjCollaborator.state = true; // Actualizar el estado a true
        await prjCollaborator.save(); // Guardar el documento actualizado
      }
    } else {
      // Crear nuevo documento para el proyecto si no existe
      await Collaborator.create({
        uid: id,
        name,
        photoUrl,
        project: { _id: projectID, accessLevel: 'contributor' },
        state: true
      });
    }

    // Comprobar y actualizar o insertar para la capa
    const layerCollaborator = await Collaborator.findOne({ uid: id, projectID, 'layer._id': layerID });
    if (layerCollaborator) {
      if (!layerCollaborator.state) {
        layerCollaborator.state = true; // Actualizar el estado a true
        await layerCollaborator.save(); // Guardar el documento actualizado
      }
    } else {
      // Crear nuevo documento para la capa si no existe
      await Collaborator.create({
        uid: id,
        name,
        photoUrl,
        layer: { _id: layerID, accessLevel: 'contributor' },
        state: true
      });
    }
  }

  next();
};


// ! Updating
export const updateRepoCollaborators = async(req: Request, res: Response, next: NextFunction) => {
  const { repoID } = req.params;
  const { modifiedCollaborators } = req.body;

  if (modifiedCollaborators.length === 0) {
      req.updatingMiddlewareState = false
      return next()
  }

  try {
      await Promise.all(modifiedCollaborators.map((colab) => {
          const { id, accessLevel } = colab;
          return Collaborator.findOneAndUpdate({ uid: id, 'repository._id': repoID }, { 'repository.accessLevel': accessLevel });
      }));
  
      // Este código no se ejecuta hasta que todas las promesas en el arreglo hayan sido resueltas
      req.updatingMiddlewareState = true;
      next();
  } catch (error) {
      res.status(400).json({
          message: 'Internal Server error',
          error
      });
  }
}


// ! Creation / Updating
export const newCollaborators = async(req: Request, res: Response, next: NextFunction) => {
    
  const { repoID } = req.params
  const { newCollaborators } = req.body

  if( newCollaborators.length === 0 ) {
      req.creatingMiddlewareState = false;
      return next();
  }

  let totalCreated = 0;

  try {

      const processCollaborator = async (collaborator) => {
          const { id, name, photoUrl, accessLevel } = collaborator;
          let existingCollaborator = await Collaborator.findOne({ uid: id, 'repository._id': repoID });

          if (existingCollaborator) {
              if (!existingCollaborator.state) {
                  await Collaborator.updateOne({ _id: existingCollaborator._id, 'repository._id': repoID }, { $set: { state: true, name: name, photoUrl: photoUrl, 'repository.accessLevel': accessLevel } });
                  totalCreated++;
              }
              // Si el colaborador existe y ya está activo, no aumentar totalCreated.
          } else {
              const c = new Collaborator({ uid: id, name, photoUrl, layer: { _id: repoID, accessLevel }, state: true });
              await c.save();
              totalCreated++;
          }
      };

      // Procesar cada colaborador con un intervalo entre ellos
      for (let i = 0; i < newCollaborators.length; i++) {
          await processCollaborator(newCollaborators[i]);
          await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100 ms antes de procesar el siguiente colaborador
      }

      req.totalCreatedCollaborators = totalCreated;
      req.creatingMiddlewareState = true;
      next();
  } catch (error) {
      res.status(400).json({
          message: 'Internal Server error',
          error
      })
  };
};


// ! Deletion
export const deleteCollaborators = async(req: Request, res: Response, next: NextFunction) => {

  const { repoID } = req.params;
  const { deletedCollaborators } = req.body;

  if (deletedCollaborators.length === 0) {
      req.deletingMiddlewareState = false
      return next()
  }

  try {
        const results = await Promise.all(deletedCollaborators.map(id => {
            return Collaborator.updateMany({ uid: id, 'repository._id': repoID }, { $set: { state: false } });
        }));

        const totalModified = results.reduce((acc, result) => acc + result.modifiedCount, 0);

        // Almacenar el total de colaboradores eliminados en el objeto de solicitud para su uso posterior
        req.totalDeletedCollaborators = totalModified;
        req.deletingMiddlewareState = true;
      next();
  } catch (error) {
      res.status(400).json({
          message: 'Internal Server error',
          error
      });
  }

}


// ! Collaborator Propper Data Return based on access level
export const getProjectReposDataBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
  const { projectID } = req.params;
  const uid = req.user._id;
  const { owner, levels, type } = req;

  if (owner && owner === true) {
      return next();
  }

  try {
    if( type === 'collaborator'){
        const collaboratorOnRepos = await Collaborator.find({ projectID, uid, state: true, 'repository._id': { $exists: true } })
                                          .lean()
                                          .populate({
                                            path: 'repository._id', // Población inicial del ID del repositorio.
                                            populate: { path: 'layerID' } // Población en cadena de `layerID` dentro del documento del repositorio.
                                          })
                                          

        const reposBaseOnLevel = collaboratorOnRepos.map(( repo) => {
          const { _id: { visibility, gitlabId, gitUrl, webUrl, layerID, ...rest }, accessLevel } = repo.repository;
          return { ...rest, visibility, layerID: layerID._id, accessLevel };
        });

        req.repos = reposBaseOnLevel
        return next()
    } else {
        const repos = await Repo.find({ projectID, visibility: { $in: levels } })
                            .lean()
                            .populate('layerID')

        const reposBaseOnLevel = repos.reduce((acc, repo) => {
          const { visibility, layerID, gitlabId, gitUrl, webUrl, ...rest } = repo;
            
          if (visibility && levels.includes(visibility) && levels.includes(layerID.visibility)) {
            acc.push({ ...rest, visibility, layerID: layerID._id, accessLevel: 'guest'});
          }
          return acc;
        }, []);

        req.repos = reposBaseOnLevel
        return next()
    }
  } catch (error) {
      console.log(error)
      res.status(400).json({
          message: 'Internal Server error',
          error
      });
  }
}