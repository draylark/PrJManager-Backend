import { Request, Response, NextFunction } from 'express';
import Collaborator from '../../models/collaboratorSchema';
import Repo from '../../models/repoSchema';
import axios from 'axios';
import Layer from '../../models/layerSchema';
import Project from '../../models/projectSchema';
import { C_On_Repository, cOnRepoData_i,  ExtendedRepository_i, PopulatedRepository_l, GuestRepository_i, gitlab_repo_i, Repository_i } from '../../interfaces/interfaces';
import { CombinedRepo_i } from '../../types/types';
import { Types } from 'mongoose';
import Noti from '../../models/notisSchema';

type newCollaborator = {
  id: string;
  accessLevel: string;
};



// ! Properties declared on the file express.d.ts

interface RepositoryMiddlwaresRequest {
  gitlabRepo: gitlab_repo_i;
  success: boolean
  repoID: Types.ObjectId;
  repo: Repository_i;
  repos?: CombinedRepo_i[] 
  createdRepos?: Repository_i[]
}


export const createRepoOnGitlab = async (req: Request, res: Response, next: NextFunction) => {
    const { layer } = req;
  
    try {

      const permanentVsibility = 'private';
      const accessToken = process.env.GITLAB_ACCESS_TOKEN
      
      // Generar un nombre de repositorio único
      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const repoName = `repo-${uniqueSuffix}`;
  
      // Crear el repositorio en GitLab
      const response = await axios.post(`https://gitlab.com/api/v4/projects`, {
        name: repoName,
        visibility: permanentVsibility,
        namespace_id: layer?.gitlabId, // ID del grupo donde se creará el repositorio
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      console.log('Repositorio creado en Gitlab', response.data)
      req.gitlabRepo = response.data;
      next();
  
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
      res.status(500).json({ message: error.message });
    }
};
export const createRepoOnMongoDB = async (req: Request, res: Response, next: NextFunction) => {

    const { projectID, layerID } = req.params;
    const { name, visibility, description, uid } = req.body;
    const { gitlabRepo } = req;

    try {
        
    const newRepo = new Repo({
      name,
      description: description,
      visibility,
      gitUrl: gitlabRepo?.http_url_to_repo,
      webUrl: gitlabRepo?.web_url, 
      projectID,
      layerID, 
      gitlabId: gitlabRepo?.id, 
      creator: uid,
      defaultBranch: gitlabRepo?.default_branch
    });

    await newRepo.save();

    await Project.findByIdAndUpdate(projectID, { $inc: { repositories: 1 } }, { new: true });
    await Layer.findByIdAndUpdate(layerID, { $inc: { repositories: 1 } }, { new: true });


    console.log('Repositorio creado en MongoDB', newRepo)

    req.success = true
    req.repoID = newRepo._id;
    next();

    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
};



// ! Validation

export const validateRepositoryExistance = async (req: Request, res: Response, next: NextFunction) => {

  const { repoID } = req.params;

  try {
      const repo: Repository_i | null = await Repo.findById(repoID);

      if (!repo) return res.status(404).json({
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

      if(  project?.owner.toString() === uid ){
          return next()
      }

      const collaborator = await Collaborator.findOne({ uid, 'repository._id': repoID })

      if (!collaborator) {
          return res.status(400).json({
              message: 'You do not have access to this repository'
          })
      }

      if( !minAccess.includes( collaborator?.repository?.accessLevel ?? 'no-access' ) ){
          return res.status(400).json({
              message: 'You do not have the required access level to perform this action'
          })
      }
      next()
  };
};
export const verifyLayerAccessLevelOfNewCollaborator = async (req: Request, res: Response, next: NextFunction) => {
  const { projectID, layerID } = req.params;
  const { newCollaborators } = req.body;

  if (newCollaborators.length === 0) {
    return next();
  };

  for (const collaborator of newCollaborators) {
    const { id, photoUrl, name } = collaborator;
    
    // Comprobar y actualizar o insertar para la capa
    const layerCollaborator = await Collaborator.findOne({ uid: id, projectID, 'layer._id': layerID });
    if (layerCollaborator && layerCollaborator.layer ) {
      if (!layerCollaborator.state) {
        if (layerCollaborator.layer.accessLevel !== undefined) { // Asegurar que accessLevel no es undefined antes de asignar un nuevo valor
          layerCollaborator.layer.accessLevel = 'contributor'; // Actualizar el nivel de acceso a colaborador
        }
        layerCollaborator.state = true; // Actualizar el estado a true
        await layerCollaborator.save(); // Guardar el documento actualizado
      }
    } else {
        // Crear nuevo documento para la capa si no existe
        await Collaborator.create({
          projectID,
          uid: id,
          name,
          photoUrl,
          layer: { _id: layerID, accessLevel: 'contributor' },
          state: true
        });
    }
  };

  next();
};
export const verifyProjectLevelAccessOfNewCollaborator = async (req: Request, res: Response, next: NextFunction) => {
  const { projectID, layerID } = req.params;
  const { newCollaborators } = req.body;

  if (newCollaborators.length === 0) {
    return next();
  }

  for (const collaborator of newCollaborators) {
    const { id } = collaborator;
    // Comprobar y actualizar o insertar para el proyecto
    const prjCollaborator = await Collaborator.findOne({ uid: id, state: true, projectID, 'project._id': projectID });
    if (!prjCollaborator) {
      return res.status(400).json({
          success: false,
          message: 'The collaborator(s) has not been found at the project level, to add a collaborator at the repository level, this must be a collaborator at the project level first.'
      });
    } 
  }
  next();
};
export const verifyTwoAccessLevelOfCollaborator = (minAccess: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { projectID, layerID } = req.params
    const { uid } = req.query
    const { project } = req

    if( project?.owner.toString() === uid ){
      return next()
    }

    const cOnProject = await Collaborator.findOne({ projectID, uid, state: true, 'project._id': projectID }).lean()

    if( cOnProject && minAccess.includes( cOnProject?.project?.accessLevel ?? 'no-access') ){
      return next()
    }

    const cOnLayer = await Collaborator.findOne({ projectID, uid, state: true, 'layer._id': layerID }).lean()

    if( cOnLayer && minAccess.includes( cOnLayer?.layer?.accessLevel ?? 'no-access') ){
      return next()
    }

    return res.status(400).json({
      success: false,
      message: 'You do not have the required access level to perform this action',
      type: 'collaborator-validation'
    })
  };
};
export const verifyLayerRepos = async(req: Request, res: Response, next: NextFunction) => {
  const { layer } = req

  try {
      if( layer && layer.repositories && layer.repositories >= 3 ){
          return res.status(400).json({
              success: false,
              message: 'The layer has reached the maximum number of repositories',
              type: 'repos-limit'
          });
      }
      next();
  } catch (error) {
      console.log('error', error)
      res.status(400).json({
          message: 'Internal Server error',
          error
      });
  };
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
      await Promise.all(modifiedCollaborators.map((colab: newCollaborator) => {
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
};


// ! Creation / Updating
export const newCollaborators = async(req: Request, res: Response, next: NextFunction) => {
  
  const { repoID, projectID } = req.params
  const { newCollaborators } = req.body
  const { repo, layer, project } = req

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
                  await Collaborator.updateOne({ projectID, _id: existingCollaborator._id, 'repository._id': repoID }, { $set: { state: true, name: name, photoUrl: photoUrl, 'repository.accessLevel': accessLevel } });
                  
                  const noti = new Noti({
                      type: 'added-to-repo',
                      title: 'Added to repository',
                      description: `You have been added to a repository.`,
                      recipient: id,
                      from: { name: 'System', ID: projectID },
                      additionalData: { repoId: repoID, repoName: repo?.name, accessLevel, projectName: project?.name, layerName: layer?.name, layerId: layer?._id }
                  });
                  await noti.save();
                  
                  totalCreated++;
              }
              // Si el colaborador existe y ya está activo, no aumentar totalCreated.
          } else {
              const c = new Collaborator({ projectID, uid: id, name,  photoUrl, repository: { _id: repoID, accessLevel }, state: true });
              await c.save();

              const noti = new Noti({
                  type: 'added-to-repo',
                  title: 'Added to repository',
                  description: `You have been added to a repository.`,
                  recipient: id,
                  from: { name: 'System', ID: projectID },
                  additionalData: { repoId: repoID, repoName: repo?.name, accessLevel, projectName: project?.name, layerName: layer?.name, layerId: layer?._id }
              });
              await noti.save();

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
      console.log(error)
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

};


// ! Collaborator Propper Data Return based on access level
export const getProjectReposDataBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
  const { projectID } = req.params;
  const uid = req?.user?._id;
  const { owner, levels, type } = req;

  if (owner && owner === true) {
      return next();
  }


  try {
    if( type === 'collaborator'){
        const collaboratorOnRepos: C_On_Repository[] = await Collaborator.find({ projectID, uid, state: true, 'repository._id': { $exists: true } })
                                          .lean()
                                          .populate({
                                            path: 'repository._id', // Población inicial del ID del repositorio.
                                            populate: { path: 'layerID' } // Población en cadena de `layerID` dentro del documento del repositorio.
                                          })
                                          

        const reposBaseOnLevel: ExtendedRepository_i[] = collaboratorOnRepos.map(( collaborator: C_On_Repository ) => {
          const { _id: { visibility, gitlabId, gitUrl, webUrl, layerID, ...rest }, accessLevel } = collaborator.repository as cOnRepoData_i ;
          return { ...rest, visibility, layerID: layerID._id, accessLevel };
        });


        const openRepos: PopulatedRepository_l[]  = await Repo.find({ projectID, visibility: 'open' })
                                .populate('layerID')
                                .lean();


        const uniqueOpenReposWithGuestAccess: GuestRepository_i[] = openRepos
        .filter((openRepo: PopulatedRepository_l) => 
            !reposBaseOnLevel.some(repo => repo._id.toString() === openRepo._id.toString())
        )
        .map((repo: PopulatedRepository_l) => {
            const { layerID: { _id, visibility }, gitUrl, webUrl, gitlabId, ...rest } = repo;
            if (visibility === 'open') {
                return { ...rest, layerID: _id, accessLevel: 'guest' } as GuestRepository_i;
            }
            return undefined;  // Aquí, si no es open, retornamos undefined. Lo manejaremos después.
        })
        .filter((repo): repo is GuestRepository_i => repo !== undefined);  


        req.repos = [ ...reposBaseOnLevel, ...uniqueOpenReposWithGuestAccess ];
        return next()
    } else {

        const repos: PopulatedRepository_l[] = await Repo.find({ projectID, visibility: { $in: levels } })
                            .lean()
                            .populate('layerID')

        const reposBaseOnLevel: GuestRepository_i[] = repos.reduce<GuestRepository_i[]>((acc, repo) => {
          const { visibility, layerID, gitlabId, gitUrl, webUrl, ...rest } = repo ;
            
          if (visibility && levels && levels.includes(visibility) && levels.includes(layerID.visibility)) {
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
};
export const getLayerReposDataBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
  const uid = req.query.uid;
  const { projectID } = req.params;
  const { owner, levels, type } = req;

  if (owner && owner === true) {
      return next();
  }

  try {
    if( type === 'collaborator'){
        const collaboratorOnRepos: C_On_Repository[] = await Collaborator.find({ projectID, uid, state: true, 'repository._id': { $exists: true } })
                                          .lean()
                                          .populate({
                                            path: 'repository._id', // Población inicial del ID del repositorio.
                                            populate: { path: 'layerID' } // Población en cadena de `layerID` dentro del documento del repositorio.
                                          })
                                          

        const reposBaseOnLevel: ExtendedRepository_i[] = collaboratorOnRepos.map(( collaborator: C_On_Repository ) => {
          const { _id: { visibility, gitlabId, gitUrl, webUrl, layerID, ...rest }, accessLevel } = collaborator.repository as cOnRepoData_i;
          return { ...rest, visibility, layerID: layerID._id, accessLevel };
        });


        const openRepos: PopulatedRepository_l[] = await Repo.find({ projectID, visibility: 'open' })
                                .populate('layerID')
                                .lean();


        const uniqueOpenReposWithGuestAccess: GuestRepository_i[] = openRepos.filter( ( openRepo: PopulatedRepository_l ) => 
          !reposBaseOnLevel.some(repo => repo._id.toString() === openRepo._id.toString())).map( repo => {                 
            const { layerID: { _id, visibility }, gitUrl, webUrl, gitlabId, ...rest} = repo 
            if( visibility === 'open' ){
              return { ...rest, layerID: _id, accessLevel: 'guest' } as GuestRepository_i;
            }
          }).filter((repo): repo is GuestRepository_i => repo !== undefined)  

        req.repos = [ ...reposBaseOnLevel, ...uniqueOpenReposWithGuestAccess ];
        return next()

    } else {
        const repos: PopulatedRepository_l[] = await Repo.find({ projectID, visibility: { $in: levels } })
                            .lean()
                            .populate('layerID')

        const reposBaseOnLevel = repos.reduce<GuestRepository_i[]>((acc, repo) => {
          const { visibility, layerID, gitlabId, gitUrl, webUrl, ...rest } = repo;
            
          if (visibility && levels && levels.includes(visibility) && levels.includes(layerID.visibility)) {
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
};



// ! Others

export const getCreatedReposDates = async(req: Request, res: Response, next: NextFunction) => {

  const { uid } = req.params;
  const { startDate, endDate } = req.query

  try {

      const repos: Repository_i[] = await Repo.find({ creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
                           .select('_id name createdAt creator layerID projectID')
                            .populate('layerID', 'name')
                            .populate('projectID', 'name')
                          .lean()

      req.createdRepos = repos
      next();
  } catch (error) {
      console.log(error)
      res.status(400).json({
          message: 'Internal Server error',
          error
      });      
  }
};
export const geProjectCreatedReposDates = async(req: Request, res: Response, next: NextFunction) => {

  const { projectId } = req.params;
  const { startDate, endDate, uid } = req.query

  try {

      const repos: Repository_i[] = await Repo.find({ projectID: projectId, creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
                           .select('_id name createdAt creator layerID projectID')
                            .populate('layerID', 'name')
                            .populate('projectID', 'name')
                          .lean()

      req.createdRepos = repos
      next();
  } catch (error) {
      console.log(error)
      res.status(400).json({
          message: 'Internal Server error',
          error
      });      
  }
};