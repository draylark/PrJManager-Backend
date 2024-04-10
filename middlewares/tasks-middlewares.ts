import { NextFunction, Request, Response } from "express";
import Collaborator from "../models/collaboratorSchema";
import Task from "../models/taskSchema";
import Collaborator from "../models/collaboratorSchema";



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
}



export const getProjectTasksBaseOnAccessForHeatMap = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const uid = req.query.uid
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    const { levels, owner, type } = req
    
    if( owner && owner === true ) {
        return next();
    }

    console.log('Tipo', type)

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
                                // .populate('layer_related_id repository_related_id')
                                .lean()         

            const filteredTasksBaseOnAccess = (await Promise.all(tasks.map(async (task) => {
                const { layer_related_id, repository_related_id } = task;
                const cLayer = await Collaborator.findOne({ uid, projectID, state: true, 'layer._id': layer_related_id });
                const cRepo = await Collaborator.findOne({ uid, projectID, state: true, 'repository._id': repository_related_id });
            
                if (cLayer && cRepo) {
                    // Si 'task' es un documento Mongoose, asegúrate de convertirlo a un objeto plano con .toObject()
                    const taskWithIdsOnly = {
                        ...task.toObject ? task.toObject() : task,
                        layer_related_id, 
                        repository_related_id
                    };
                    return taskWithIdsOnly;
                }
                // No es necesario retornar nada aquí, lo cual resultará en 'undefined'
            }))).filter(task => task !== undefined); //

            console.log('Tareas filtradas en base a el acceso exclusivo', filteredTasksBaseOnAccess)
            req.tasks = filteredTasksBaseOnAccess;
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

            console.log('Tareas filtradas en base a el acceso por nivel', filteredTasksBaseOnLevel)
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

}



export const getProjectTasksBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { levels, owner } = req
    
    if( owner && owner === true ) {
        return next();
    }

    try {
        const tasks = await Task.find({ project: projectID, status: { $in: ['completed', 'approval'] } })
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

        const completedTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'completed');
        const approvalTasks = filteredTasksBaseOnLevel.filter(task => task.status === 'approval');

        req.completedTasks = completedTasks;
        req.approvalTasks = approvalTasks;
        next();

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        })
    }
};

