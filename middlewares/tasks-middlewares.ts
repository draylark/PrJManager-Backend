import { NextFunction, Request, Response } from "express";
import Collaborator from "../models/collaboratorSchema";
import Task from "../models/taskSchema";


const evalAccess = ( cOnLayer, cOnRepo, lVisibility, RVisibility ) => {

    if( cOnLayer && cOnRepo && cOnLayer.state && !cOnRepo.state && RVisibility === 'open' ) {
        return true;
    }

    if( cOnLayer && cOnRepo && !cOnLayer.state && lVisibility === 'open' && !cOnRepo.state && RVisibility === 'open' ) {
        return true;
    }

    return false;
};

export const validateUserAccessForTaskData = async(req: Request, res: Response, next: NextFunction) => {

    const { projectID } = req.params;
    const uid = req.query.uid

    try {
        const collaboratorOn = await Collaborator.find({
            uid,
            projectID,
            state: true,
            $or: [
              { 'layer._id': { $exists: true } },
              { 'repository._id': { $exists: true } }
            ]
          })
          .populate('layer._id')
          .populate('repository._id');

        if (!collaboratorOn) {
           req.type = 'guest'
           return next()
        }

        req.collaboratorOn = collaboratorOn;
        req.type = 'collaborator'
        next();
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        })
    }
};

export const getProjectTasksBaseOnAccessForHeatMap = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const uid = req.query.uid
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    const { levels, owner, type } = req
    
    if( owner && owner === true ) {
        return next();
    }

    let matchCondition = { project: projectID, status: 'completed' };
        if (year) {
            matchCondition = { 
            ...matchCondition,
            updatedAt: {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
            };
        }

    try {
        if( type === 'collaborator') {
            const tasks = await Task.find(matchCondition)
                                .populate('layer_related_id repository_related_id')
                                .lean()         

            const filteredTasksBaseOnAccess = (await Promise.all(tasks.map(async (task) => {
                const { layer_related_id: { _id: taskId }, repository_related_id: { _id: repoId }, ...rest } = task;
                const cLayer = await Collaborator.findOne({ uid, projectID, state: true, 'layer._id': taskId });
                const cRepo = await Collaborator.findOne({ uid, projectID, state: true, 'repository._id': repoId });
            
                if (cLayer && cRepo) {
                    return {
                        ...rest,
                        layer_related_id: taskId, 
                        repository_related_id: repoId,
                    };;
                }
            }))).filter(task => task !== undefined);


            const uniqueTasksOnOpenParents = ( await Promise.all( tasks.filter(openTask => 
                !filteredTasksBaseOnAccess.some(task => task._id.toString() === openTask._id.toString())
              ).map( async task => {  
                    const { layer_related_id: { _id: taskId, visibility: layerVis }, repository_related_id: { _id: repoId, visibility: repoVis }, ...rest } = task;

                    const cLayer = await Collaborator.findOne({ uid, projectID, 'layer._id': taskId });
                    const cRepo = await Collaborator.findOne({ uid, projectID, 'repository._id': repoId });

                    if(evalAccess(cLayer, cRepo, layerVis, repoVis)) {
                        return { 
                            ...rest,
                            layer_related_id: taskId, 
                            repository_related_id: repoId,
                         };
                    };
              })
             )).filter(task => task !== undefined);
              
            req.tasks = [...filteredTasksBaseOnAccess, ...uniqueTasksOnOpenParents];
            next();

        } else {
            const tasks = await Task.find(matchCondition)
                                .populate('layer_related_id repository_related_id')
                                .lean()

            const filteredTasksBaseOnLevel = tasks.reduce((acc, task) => {
                const { layer_related_id, repository_related_id } = task;

                if (layer_related_id && repository_related_id && levels.includes(layer_related_id.visibility) && levels.includes(repository_related_id.visibility)) {
                    const taskWithIdsOnly = {
                        ...task, // Convierte el documento de Mongoose a un objeto JS plano.
                        layer_related_id: layer_related_id._id, // Usa el _id del documento poblado.
                        repository_related_id: repository_related_id._id, // Ídem.
                    };
                    acc.push(taskWithIdsOnly);
                };
                return acc;
            }, []);

            req.tasks = filteredTasksBaseOnLevel;
            next();
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        })
    }

};

export const getProjectTasksBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { levels, owner, type } = req
    const uid = req.query.uid
    
    if( owner && owner === true ) {
        return next();
    }

    try {
                               
        if( type === 'collaborator') {

            const tasks = await Task.find({ project: projectID, status: { $in: ['completed', 'approval'] } })
            .populate('layer_related_id repository_related_id')
            .lean()


            // ! Tareas en el que el usuario tiene acceso como colaborador ( state : true )

            const filteredTasksBaseOnAccess = (await Promise.all(tasks.map(async (task) => {
                const { layer_related_id: { _id: taskId }, repository_related_id: { _id: repoId }, ...rest } = task;
                const cLayer = await Collaborator.findOne({ uid, projectID, state: true, 'layer._id': taskId });
                const cRepo = await Collaborator.findOne({ uid, projectID, state: true, 'repository._id': repoId });
            
                if (cLayer && cRepo) {
                    return {
                        ...rest,
                        layer_related_id: taskId, 
                        repository_related_id: repoId,
                    };;
                }
            }))).filter(task => task !== undefined); 


            // ! Tareas en el caso de que el usuario no tiene acceso como colaborador ( state: false ), pero los padres son abiertos

            const uniqueTasksOnOpenParents = ( await Promise.all( tasks.filter(openTask => 
                !filteredTasksBaseOnAccess.some(task => task._id.toString() === openTask._id.toString())
              ).map( async task => {  
                    const { layer_related_id: { _id: layerId, visibility: layerVis }, repository_related_id: { _id: repoId, visibility: repoVis }, ...rest } = task;

                    const cLayer = await Collaborator.findOne({ uid, projectID, 'layer._id': layerId });
                    const cRepo = await Collaborator.findOne({ uid, projectID, 'repository._id': repoId });

                    if(evalAccess(cLayer, cRepo, layerVis, repoVis)) {
                        return { 
                            ...rest,
                            layer_related_id: layerId, 
                            repository_related_id: repoId,
                         };
                    };
              })
             )).filter(task => task !== undefined);
              

            const filteredTasksBaseOnLevel = [...filteredTasksBaseOnAccess, ...uniqueTasksOnOpenParents];

            const completedTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'completed');
            const approvalTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'approval');

            req.completedTasks = completedTasks;
            req.approvalTasks = approvalTasks;
            next();

        } else {

            const tasks = await Task.find({ project: projectID, status: { $in: ['completed'] } })
            .populate('layer_related_id repository_related_id')
            .lean()

            // ! Tareas en el caso de que el usuario sea un guest

            const filteredTasksForGuests = tasks.reduce((acc, task) => {
                const { layer_related_id, repository_related_id } = task;

                if (layer_related_id && repository_related_id && levels.includes(layer_related_id.visibility) && levels.includes(repository_related_id.visibility)) {
                    const taskWithIdsOnly = {
                        ...task, // Convierte el documento de Mongoose a un objeto JS plano.
                        layer_related_id: layer_related_id._id, // Usa el _id del documento poblado.
                        repository_related_id: repository_related_id._id, // Ídem.
                    };
                    acc.push(taskWithIdsOnly);
                };
                return acc;
            }, []);

            req.completedTasks = filteredTasksForGuests;
            req.approvalTasks = [];
            next();
        }


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        })
    }
};

export const validateCollaboratorAccess = ( minAccess: string[] ) => {
    return async( req: Request, res: Response, next: NextFunction ) => {

        const { project, owner } = req;
        const { projectID } = req.params;
        const { uid, layerID, repoID, } = req.query

        try {
            if( project.owner.toString() === uid ) {
                req.type = 'owner';
                return next();
            }

            const collaboratorOnProject = await Collaborator.findOne({ uid, projectID, state: true, 'project._id': projectID })
            if (!collaboratorOnProject) {
                return res.status(401).json({
                    success: false,
                    message: 'You do not have access to this resource'
                })
            };


            if( minAccess.includes( collaboratorOnProject.project.accessLevel ) ) {
                req.collaborator = collaboratorOnProject;
                req.type = 'collaborator';
                return next();
            };


            const collaboratorOnLayer = await Collaborator.findOne({ uid, projectID, state: true, 'layer._id': layerID })
            if ( collaboratorOnLayer && minAccess.includes( collaboratorOnLayer.layer.accessLevel ) ) {
                req.collaborator = collaboratorOnLayer;
                req.type = 'collaborator';
                return next();
            };


            const collaboratorOnRepo = await Collaborator.findOne({ uid, projectID, state: true, 'repository._id': repoID })
            if ( collaboratorOnRepo && minAccess.includes( collaboratorOnRepo.repository.accessLevel ) ) {
                req.collaborator = collaboratorOnRepo;
                req.type = 'collaborator';
                return next();
            };


            return res.status(401).json({
                success: false,
                message: 'You do not have access to this resource'
            })
         
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Internal Server error',
                error
            })
        }
    }
}