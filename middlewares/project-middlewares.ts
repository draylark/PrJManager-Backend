import { Request, Response, NextFunction } from 'express';
import Project from '../models/projectSchema';
import Layer from '../models/layerSchema';
import Repo from '../models/repoSchema';
import Collaborator from '../models/collaboratorSchema';
import Noti from '../models/notisSchema';


// ! Middlewares Helpers

export const whatIsTheAccess = (accessLevel: string) => {
    switch (accessLevel) {
        case 'contributor':
            return {
                levels: ['open'],
            };
        case 'coordinator':
            return {
                levels: ['open', 'internal'],
            };
        case 'manager':
        case 'administrator':
            return {
                levels: ['open', 'internal', 'restricted'],
            };
        default:
            return { levels: [] };
    };
};
const appropiateLevelAccessOnLayer = (accessLevel: string ) => {
    switch (accessLevel) {
        case 'contributor':
            return 'contributor';
        case 'coordinator':
            return 'coordinator';
        case 'manager':
            return 'manager';
        case 'administrator':
            return 'administrator';
        default:
            return 'contributor';
    };
};
const appropiateLevelAccessOnRepo = (accessLevel: string ) => {
    switch (accessLevel) {
        case 'contributor':
            return 'reader';
        case 'coordinator':
            return 'editor';
        case 'manager':
            return 'manager';
        case 'administrator':
            return 'administrator';
        default:
            return 'contributor';
    };
};



// ! Validation
export const validateProjectExistance = async (req: Request, res: Response, next: NextFunction) => {

    const { projectID } = req.params

    const project = await Project.findById(projectID)

    if (!project) {
        return res.status(400).json({
            message: 'Project does not exist'
        })
    }

    req.project = project
    next()
};

export const validateUserAccessOnProject = async (req: Request, res: Response, next: NextFunction) => {
    const { project } = req
    const uid = req.query.uid;

    if(  project.owner.toString() === uid ){
        req.type = 'owner'
        req.owner = true
        return next() 
    }

    try {         
        const collaborator = await Collaborator.findOne({ uid, 'project._id': project._id, state: true })

        if (!collaborator) {
            req.type = 'guest'
            req.levels = [ 'open' ]
            return next()
        }

        const { levels } = whatIsTheAccess(collaborator.project.accessLevel);

        req.type = 'collaborator'
        req.owner = false
        req.levels = levels;

        next()
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }

}

export const validateCollaboratorAccessOnProject = ( minAccess: string[] ) => {
    return async ( req: Request, res: Response, next: NextFunction ) => {
        const { project } = req
        const { projectID } = req.params
        const uid = req.query.uid;

        if(  project.owner.toString() === uid ){
            return next()
        }

        const collaborator = await Collaborator.findOne({ uid, 'project._id': projectID })

        if (!collaborator) {
            return res.status(400).json({
                message: 'You do not have access to this project'
            })
        }

        if( !minAccess.includes( collaborator.project.accessLevel ) ){
            return res.status(400).json({
                message: 'You do not have the required access level to perform this action'
            })
        }
        next()
    };
};

export const ownerOrCollaborator = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const project = req.project;
    const uid = req.user._id;

    if (project.owner.toString() === uid.toString()) {

        req.type = 'owner';
        return next();

    } else {
        const collaborator = await Collaborator.findOne({ uid, 'project._id': projectID });

        if (!collaborator) {
            return res.status(400).json({
                message: 'You do not have access to this project'
            });
        }

        const { levels } = whatIsTheAccess(collaborator.project.accessLevel);

        if (!levels.includes('open')) {
            return res.status(400).json({
                message: 'You do not have access to this project'
            });
        }

        req.type = 'collaborator';
        req.levels = levels;
        next();
    }
}




// ! Collaborators Creation
export const newCollaborators = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { newCollaborators } = req.body;
    const { project } = req;

    if (newCollaborators.length === 0) {
        req.invMiddlewareState = false;
        return next();
    }

    try {
       
        await Promise.all(newCollaborators.map(async collaborator => {
            const noti = new Noti({ 
                type: 'project-invitation', 
                title: 'Project Invitation', 
                description: `You have been invited to collaborate on project`,
                recipient: collaborator.id, 
                from: { name: req.user.username, ID: req.user._id, photoUrl: req.user.photoUrl || null }, 
                additionalData: {
                    project_name: project.name,
                    projectID: projectID,
                    accessLevel: collaborator.accessLevel,
                }
            });
            noti.save()
        }));

        req.invMiddlewareState = true;
        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
};

export const createOtherCDataOfProjectCreatedCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { projectID } = req.params;
    const { uid, name, photoUrl, accessLevel, requestStatus } = req.body;
    if (requestStatus === 'reject') {
        return next();
    }


    try {
        const layers =  await Layer.find({ project: projectID, 'visibility': { $exists: true } });
        const repos =  await Repo.find({ projectID: projectID, 'visibility': { $exists: true } });
           

            await Promise.all(layers.map(async layer => {
                const { levels } = whatIsTheAccess(accessLevel);

                let existingCollaborator = await Collaborator.findOne({ uid, 'layer._id': layer._id });

                if (existingCollaborator && !existingCollaborator.state) {   
                    if( levels.includes(layer.visibility) ) {
                        await Collaborator.updateOne({ uid, 'layer._id': layer._id }, { $set: { state: true, 'layer.accessLevel' : appropiateLevelAccessOnLayer(accessLevel) } });
                    }                
                } else {
                    // Crear el colaborador en la capa si tiene acceso
                    if (levels.includes(layer.visibility)) {
                        const c = new Collaborator({ uid, name, photoUrl, layer: { _id: layer._id, accessLevel: appropiateLevelAccessOnLayer(accessLevel) }, state: true });
                        await c.save();
                    }
                };
            }));
  

            await Promise.all(repos.map(async repo => {
                const { levels } = whatIsTheAccess(accessLevel);
                // Crear el colaborador en el repositorio si tiene acceso
                let existingCollaborator = await Collaborator.findOne({ uid, 'repository._id': repo._id });

                if (existingCollaborator && !existingCollaborator.state) {
                    if( levels.includes(repo.visibility) ) {
                        await Collaborator.updateOne({ uid, 'repository._id': repo._id }, { $set: { state: true, 'repository.accessLevel' : appropiateLevelAccessOnRepo(accessLevel) } });
                    }
                } else {
                    if (levels.includes(repo.visibility)) {
                        const c = new Collaborator({ uid, name, photoUrl, repository: { _id: repo._id, accessLevel: appropiateLevelAccessOnRepo(accessLevel) }, state: true });
                        await c.save();
                    }
                };
            }));
 
        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }

};

export const handlePrJCollaboratorInvitation = async( req: Request, res: Response, next: NextFunction ) => {
    const { projectID } = req.params;
    const { uid, name, photoUrl, accessLevel, notiID, requestStatus } = req.body;

    try {
        if( requestStatus === 'accept' ) {
            const existingCollaborator = await Collaborator.findOne({ uid, 'project._id': projectID });

            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    await Collaborator.updateOne({ uid, 'project._id': projectID }, { $set: { state: true, name, photoUrl, 'project.accessLevel': accessLevel } });
                    await Noti.findByIdAndUpdate ( notiID, { status: false } );

                    return next()
                }
            } else {
                const c = new Collaborator({ uid, name, photoUrl, project: { _id: projectID, accessLevel }, state: true });
                await c.save();

                return next()
            }
        } else {
            await Noti.findByIdAndUpdate( notiID, { status: false } );
            return next()
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }


}


// ! Collaborators Update

export const updateCollaborators = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { modifiedCollaborators } = req.body;

    if (modifiedCollaborators.length === 0) {
        req.updatingMiddlewareState = false
        return next()
    };

    try {
        await Promise.all(modifiedCollaborators.map((colab) => {
            const { id, accessLevel } = colab;
            return Collaborator.findOneAndUpdate({ uid: id, 'project._id': projectID }, { 'project.accessLevel': accessLevel });
        }));
    
        // Este código no se ejecuta hasta que todas las promesas en el arreglo hayan sido resueltas
        req.updatingMiddlewareState = true;
        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
};
export const updateOtherCDataOfProjectModifiedCollaborators = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { modifiedCollaborators } = req.body;
    const { projectLayers, projectRepos } = req;

    if (modifiedCollaborators.length === 0) {
        return next();
    }

    try {
        // Obtener todas las capas y repositorios del proyecto
        const layers = projectLayers.length !== 0 
            ? projectLayers
            : await Layer.find({ project: projectID, 'visibility': { $exists: true } });
            

        const repos = projectRepos.length !== 0 
            ? projectRepos
            : await Repo.find({ projectID: projectID, 'visibility': { $exists: true } });

        // Actualizar los colaboradores en las capas y repositorios
        await Promise.all(modifiedCollaborators.map(async collaborator => {
            const { levels } = whatIsTheAccess(collaborator.accessLevel);
        
        // Asunción: `Layer` es el modelo de las capas
        await Promise.all(layers.map(async layer => {
                const existingCollaborator = await Collaborator.findOne({ 'layer._id': layer._id, uid: collaborator.id });
        
                if (!levels.includes(layer.visibility)) {
                    if (existingCollaborator) {
                        // Si el colaborador ya no debería tener acceso a la capa, actualiza el estado a false
                        await Collaborator.updateOne(
                            { _id: existingCollaborator._id },
                            { $set: { state: false } }
                        );
                    }
                    // No hacer nada si el colaborador no tiene un documento de colaborador en esta capa
                } else {
                    if (existingCollaborator) {
                        // Si el colaborador debería tener acceso y ya tiene un documento, actualiza el estado a true y el nivel de acceso
                        await Collaborator.updateOne(
                            { _id: existingCollaborator._id },
                            { $set: { state: true, 'layer.accessLevel': appropiateLevelAccessOnLayer(collaborator.accessLevel) } }
                        );
                    } else {
                        // Si el colaborador debería tener acceso pero no tiene un documento, crea uno nuevo
                        const newCollaborator = new Collaborator({
                            layer: { _id: layer._id, accessLevel: appropiateLevelAccessOnLayer(collaborator.accessLevel) },
                            projectID,
                            uid: collaborator.id,
                            name: collaborator.name,
                            photoUrl: collaborator.photoUrl || null,
                            state: true // Asumiendo que el estado por defecto es true
                            // Añade otros campos requeridos según tu esquema de colaborador
                        });
                        await newCollaborator.save();
                    }
                }
            }));
        }));


        await Promise.all(modifiedCollaborators.map(async collaborator => {
            const { levels } = whatIsTheAccess(collaborator.accessLevel);
        


            // Asumiendo que `Layer` y `Repo` son los modelos de las capas y repositorios, respectivamente
            await Promise.all(repos.map(async repo => {
                const existingCollaborator = await Collaborator.findOne({ 'repository._id': repo._id, uid: collaborator.id })
                                                   .populate({
                                                      path: 'repository._id',
                                                      populate: { path: 'layerID'}
                                                    })
                const { _id: { layerID } } = existingCollaborator.repository

                if (!levels.includes(repo.visibility) || !levels.includes(layerID.visibility) ) {
                    if (existingCollaborator) {
                        console.log('Niveles', levels)
                        console.log('Colaborador', existingCollaborator)
                        console.log('Visualizacion de capa',layerID)
                        console.log('Repositorio',repo)

                        await Collaborator.updateOne(
                            { _id: existingCollaborator._id },
                            { $set: { state: false } }
                        );

                    }
                    // No hacer nada si no existe porque el colaborador no debería tener acceso
                } else {
                    if (existingCollaborator) {
                        // El colaborador debería tener acceso y ya existe, actualiza el estado a true y el nivel de acceso
                        await Collaborator.updateOne(
                            { _id: existingCollaborator._id },
                            { $set: { state: true, 'repository.accessLevel': appropiateLevelAccessOnRepo(collaborator.accessLevel) } }
                        );
                    } else {
                        // El colaborador debería tener acceso pero no existe un documento, créalo
                        const newCollaborator = new Collaborator({
                            repository: { _id: repo._id, accessLevel: appropiateLevelAccessOnRepo(collaborator.accessLevel) },
                            projectID,
                            uid: collaborator.id,
                            name: collaborator.name,
                            photoUrl: collaborator.photoUrl || null,
                            state: true // Asumiendo que quieres que el estado sea true por defecto
                            // Añade otros campos requeridos según tu esquema de colaborador
                        });
                        await newCollaborator.save();
                    }
                }
            }));
        })); 

        req.projectLayers = layers;
        req.projectRepos = repos;

        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
};



// ! Collaborators Deletion

export const deleteCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { projectID } = req.params;
    const { deletedCollaborators } = req.body;


    if (deletedCollaborators.length === 0) {
        req.totalDeletedCollaborators = 0;
        req.deletingMiddlewareState = false;
        return next()
    }
  
    try {
        // Ejecutar todas las operaciones de actualización y capturar los resultados
        const results = await Promise.all(deletedCollaborators.map(id => {
            return Collaborator.updateMany({ uid: id, 'project._id': projectID }, { $set: { state: false } });
        }));
        const totalModified = results.reduce((acc, result) => acc + result.modifiedCount, 0);

        // Almacenar el total de colaboradores eliminados en el objeto de solicitud para su uso posterior
        req.totalDeletedCollaborators = totalModified;
        req.deletingMiddlewareState = true;
        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
  
};
export const updateOtherCollaboratorDataOfDeletedCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { projectID } = req.params;
    const { deletedCollaborators } = req.body;

    if (deletedCollaborators.length === 0) {
        req.projectLayers = [];
        req.projectRepos = [];
        return next()
    }

    try {
        const layers = await Layer.find({ project: projectID })
        const repos = await Repo.find({ projectID: projectID })

        await Promise.all(layers.map(layer =>
            Collaborator.updateMany(
                { 'layer._id': layer._id, uid: { $in: deletedCollaborators.map(id => id) } },
                { $set: { state: false } }
            )
        ));


        await Promise.all(repos.map(repo =>
            Collaborator.updateMany(
                { 'repository._id': repo._id, uid: { $in: deletedCollaborators.map(id => id) } },
                { $set: { state: false } }
            )
        ));

        req.projectLayers = layers;
        req.projectRepos = repos;

        next();

        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }

};




// ! Collaborator Propper Data Return based on access level

export const returnDataBaseOnAccessLevel = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { accessLevel } = req.body
    const uid = req.user._id;
    const { type } = req;

    if (type === 'owner') {
        return next();
    }

    const { levels } = whatIsTheAccess(accessLevel);

    try {

        const collaboratorOnLayers = await Collaborator.find({ uid, projectID, state: true, 'layer._id': { $exists: true } })
                                            .populate('layer._id')

        
        const collaboratorOnRepos = await Collaborator.find({ uid, projectID, state: true, 'repository._id': { $exists: true } })
                                            .populate('repository._id')


        const layersBaseOnLevel = collaboratorOnLayers.map( colab => {
            if( levels.includes(colab.layer.visibility) ){
                return colab
            }
        }).filter( colab => colab !== undefined )


        const reposBaseOnLevel = collaboratorOnRepos.map( colab => {
            if( levels.includes(colab.repository.visibility) ){
                return colab
            }
        }).filter( colab => colab !== undefined )

        return res.json({
            layers: layersBaseOnLevel,
            repos: reposBaseOnLevel
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
}


