import { Request, Response, NextFunction } from 'express';
import Collaborator from '../models/collaboratorSchema';
import Layer from '../models/layerSchema';
import Repo from '../models/repoSchema';
import Noti from '../models/notisSchema';


// ! Middlewares Helpers

const whatIsTheAccess = (accessLevel: string) => {
    switch (accessLevel) {
        case 'guest':
            return {
                levels: ['open'],
            };
        case 'contributor':
            return {
                levels: ['open', 'internal'],
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




// ! Validations

export const validateLayerExistance = async (req: Request, res: Response, next: NextFunction) => {

    const { layerID } = req.params;

    try {
        const layer = await Layer.findById(layerID);

        if (!layer) return res.status(404).json({
            message: 'Layer not found'
        });

        req.layer = layer;

        next();
    } catch (error) {
        console.log('error2')
        res.status(500).json({
            message: 'Internal Server Error'
        });
    };
};

export const validateCollaboratorAccessOnLayer = ( minAccess: string[] ) => {
    return async ( req: Request, res: Response, next: NextFunction ) => {
        const { project } = req
        const { layerID } = req.params
        const uid = req.query.uid;

        if(  project.owner.toString() === uid ){
            return next()
        }

        const collaborator = await Collaborator.findOne({ uid, 'layer._id': layerID })

        if (!collaborator) {
            return res.status(400).json({
                success: false,
                message: 'You do not have access to this Layer'
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

// export const verifyOneLevelAccessOfNewCollaborator = async( req: Request, res: Response, next: NextFunction ) => {

//     const { project } = req;
//     const { newCollaborators } = req.body;
//     const { projectID } = req.params
    
//     if( newCollaborators.length === 0 ) {
//         return next();
//     }

//     try {
//         await Promise.all(newCollaborators.map( async (collaborator) => {
//             const { id, photoUrl, name } = collaborator;
//             const prjCollaborator = await Collaborator.findOne({ uid: id, 'project._id': project._id });
//             if (!prjCollaborator) {
//                 const c = new Collaborator({ uid: id, name, photoUrl, projectID, project: { _id: project._id, accessLevel: 'contributor' } });
//                 await c.save();
//             }
//         }));

//         next();
//     } catch (error) {
//         console.log('error AASDASDASDGSC', error)
//         res.status(400).json({
//             message: 'Internal Server error',
//             error
//         });
//     }
// };


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
            message: 'The collaborator(s) has not been found at the project level, to add a collaborator at the layer level, this must be a collaborator at the project level first.'
        });
      } 
    }
    next();
};


export const verifyProjectLayers = async(req: Request, res: Response, next: NextFunction) => {
    const { project } = req
    try {

        if( project && project?.layers >= 3 ){
            return res.status(400).json({
                success: false,
                message: 'The Project has reached the maximum number of layers',
                type: 'layers-limit'
            });
        }
        next();
    } catch (error) {
        console.log('error', error)
        res.status(400).json({
            message: 'Internal Server error',
            error,
            type: 'server-error'
        });
    }

};
  


// ! Creation / Updating

export const newCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { layerID, projectID } = req.params
    const { newCollaborators } = req.body
    const { layer, project } = req

    if( newCollaborators.length === 0 ) {
        req.creatingMiddlewareState = false;
        return next();
    }

    let totalCreated = 0;

    try {

        const processCollaborator = async (collaborator) => {
            const { id, name, photoUrl, accessLevel } = collaborator;
            let existingCollaborator = await Collaborator.findOne({ uid: id, 'layer._id': layerID, projectID });
            console.log('existingCollaborator', existingCollaborator)

            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    await Collaborator.updateOne({ _id: existingCollaborator._id, 'layer._id': layerID, projectID }, { $set: { state: true, name: name, photoUrl: photoUrl, 'layer.accessLevel': accessLevel } });
                    
                    const noti = new Noti({
                        type: 'added-to-layer',
                        title: 'You have been added to a Layer',
                        recipient: id,
                        from: { name: 'System', ID: projectID },
                        additionalData: { layerId: layerID, layerName: layer.name, projectName: project.name, accessLevel }
                    });
                    await noti.save();

                    totalCreated++;
                }
                // Si el colaborador existe y ya está activo, no aumentar totalCreated.
            } else {

                console.log('new collaborator')
                const c = new Collaborator({ uid: id, name, photoUrl, projectID, layer: { _id: layerID, accessLevel }, state: true });
                await c.save();

                const noti = new Noti({
                    type: 'added-to-layer',
                    title: 'You have been added to a Layer',
                    recipient: id,
                    from: { name: 'System', ID: projectID },
                    additionalData: { layerId: layerID, layerName: layer.name, projectName: project.name, accessLevel }
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
        console.log('1',error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
    };
};

export const createOtherCDataOfLayerCreatedCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { projectID, layerID } = req.params;
    const { newCollaborators } = req.body;
    const { projectRepos } = req;

    if (newCollaborators.length === 0) {
        return next();
    }

    try {

        const repos = projectRepos.length !== 0 
            ? projectRepos
            : await Repo.find({ projectID: projectID, layerID, 'visibility': { $exists: true } });

        await Promise.all(newCollaborators.map(async collaborator => {
            const { id, name, photoUrl, accessLevel } = collaborator;
            const { levels } = whatIsTheAccess(accessLevel);

            // Asumiendo que `Layer` y `Repo` son los modelos de las capas y repositorios, respectivamente
            await Promise.all(repos.map(async repo => {
                // Crear el colaborador en el repositorio si tiene acceso
                let existingCollaborator = await Collaborator.findOne({ uid: id, projectID, 'repository._id': repo._id });

                console.log('existingCollaborator en repo de layer', existingCollaborator)

                if (existingCollaborator && !existingCollaborator.state) {
                    if( levels.includes(repo.visibility) ) {
                        await Collaborator.updateOne({ uid: id, projectID, 'repository._id': repo._id }, { $set: { state: true, 'repository.accessLevel' : appropiateLevelAccessOnRepo(accessLevel) } });
                    }
                } else {
                    if (levels.includes(repo.visibility)) {
                        const c = new Collaborator({ uid: id, name, photoUrl, repository: { _id: repo._id, accessLevel: appropiateLevelAccessOnRepo(accessLevel) }, state: true, projectID });
                        await c.save();
                    }
                };
            }));
        }));

        next();
    } catch (error) {
        console.log('2',error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }

};




// ! Updating

export const updateLayerCollaborators = async(req: Request, res: Response, next: NextFunction) => {
    const { layerID } = req.params;
    const { modifiedCollaborators } = req.body;

    if (modifiedCollaborators.length === 0) {
        req.updatingMiddlewareState = false
        return next()
    }

    try {
        await Promise.all(modifiedCollaborators.map((colab) => {
            const { id, accessLevel } = colab;
            return Collaborator.findOneAndUpdate({ uid: id, 'layer._id': layerID }, { 'layer.accessLevel': accessLevel });
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

export const updateOtherCDataOfLayerModifiedCollaborators = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID, layerID } = req.params;
    const { modifiedCollaborators } = req.body;
    const { projectRepos } = req;

    if (modifiedCollaborators.length === 0) {
        return next();
    }

    try {

        const repos = projectRepos.length !== 0 
            ? projectRepos
            : await Repo.find({ projectID, layerID, 'visibility': { $exists: true } });


        await Promise.all(modifiedCollaborators.map(async collaborator => {
            const { levels } = whatIsTheAccess(collaborator.accessLevel);
        
            // Asumiendo que `Layer` y `Repo` son los modelos de las capas y repositorios, respectivamente
            await Promise.all(repos.map(async repo => {
                const existingCollaborator = await Collaborator.findOne({ 'repository._id': repo._id, uid: collaborator.id });
        
                if (!levels.includes(repo.visibility)) {
                    if (existingCollaborator) {
                        // El colaborador ya no debería tener acceso, actualiza el estado a false
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




// ! Deletion

export const deleteCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { layerID, projectID } = req.params;
    const { deletedCollaborators } = req.body;
  
    if (deletedCollaborators.length === 0) {
        req.totalDeletedCollaborators = 0
        req.deletingMiddlewareState = false
        return next()
    }
  
    try {
        // Ejecutar todas las operaciones de actualización y capturar los resultados
        const results = await Promise.all(deletedCollaborators.map(id => {
            return Collaborator.updateMany({ uid: id, 'layer._id': layerID, projectID }, { $set: { state: false } });
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

export const updateOtherCDataOfDeletedLayerCollaborators = async(req: Request, res: Response, next: NextFunction) => {

    const { projectID, layerID } = req.params;
    const { deletedCollaborators } = req.body;

    if (deletedCollaborators.length === 0) {
        req.projectRepos = [];
        return next()
    }

    try {
        await Promise.all(deletedCollaborators.map( async id => {         
            const collaborators = await Collaborator.find({ uid: id, projectID, 'repository._id': { $exists: true } })
                                            .lean()
                                            .populate({
                                                path: 'repository._id',
                                                populate: { path: 'layerID' }
                                            })         

            await Promise.all(collaborators.map(collaborator => {
                if (!collaborator.repository) {
                    console.error('Error: repository is null for collaborator', collaborator);
                    return; // Skip this iteration if repository is null
                }
            
                const { _id: { layerID: layer, ...rest } } = collaborator.repository;
            
                if (layer && layer._id.toString() === layerID && collaborator.state === true) {
                    // Process your update logic here
                    return Collaborator.updateOne(
                        { uid: id, projectID, 'repository._id': collaborator.repository._id },
                        { $set: { state: false } }
                    );
                }
            }));
        })) 

        next(); 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    };
};



// ! Collaborator Propper Data Return based on access level
export const getProjectLayersDataBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
        
    const uid = req.query.uid;    
    const { projectID } = req.params;
    const { owner, levels, type } = req;

    if (owner && owner === true) {
        return next();
    }

    try {
        if( type === 'collaborator'){
            const collaboratorOnLayers = await Collaborator.find({ projectID, uid, state: true, 'layer._id': { $exists: true } })
                                                .populate('layer._id')
                                                .lean(); 

            const layersBaseOnLevel = collaboratorOnLayers.map( (collaborator) => {
                const { _id: { gitlabId, ...rest }, accessLevel } = collaborator.layer
                return { ...rest, accessLevel}
            });


            const openLayers = await Layer.find({ project: projectID, visibility: 'open' })
                                        .lean();

            // Paso 4: Filtrar capas 'open' para excluir las ya incluidas en layersBaseOnLevel y asignarles 'guest' como nivel de acceso.
            const uniqueOpenLayersWithGuestAccess = openLayers.filter(openLayer => 
                !layersBaseOnLevel.some(layer => layer._id.toString() === openLayer._id.toString())
            ).map( layer => {  const { gitlabId, __v, ...rest} = layer 
                return { ...rest, accessLevel: 'guest' } 
            });             
                                   

            // Combinar los dos conjuntos de capas y devolverlos.
            req.layers = [...layersBaseOnLevel, ...uniqueOpenLayersWithGuestAccess];
            return next()
        } else {
            const layers = await Layer.find({ project: projectID, visibility: { $in: levels } })
                                      .lean(); 
        
            const layersWithGuestAccess = layers.map(layer => {
                const { gitlabId, __v, ...rest} = layer
                return { ...rest, accessLevel: 'guest' }
            });    
            req.layers = layersWithGuestAccess;
            return next();
        };
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });
    }
}





export const getCreatedLayersDates = async(req: Request, res: Response, next: NextFunction) => {

    const { uid } = req.params;
    const { startDate, endDate } = req.query

    try {
        const layers = await Layer.find({ creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
                                  .select('creator createdAt name _id project')
                                  .populate('project', 'name _id')
                                  .lean();

        req.createdLayers = layers;
        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });      
    }
}

export const getProjectCreatedLayersDates = async(req: Request, res: Response, next: NextFunction) => {

    const { projectId } = req.params;
    const { startDate, endDate, uid } = req.query

    try {
        const layers = await Layer.find({ project: projectId, creator: uid, createdAt: { $gte: startDate, $lte: endDate } })
                                  .select('creator createdAt name _id project')
                                  .populate('project', 'name _id')
                                  .lean();

        req.createdLayers = layers;
        next();
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        });      
    }
}