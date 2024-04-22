import { Response, Request } from 'express'
import Project from '../models/projectSchema';
import Task from '../models/taskSchema';
import Noti from '../models/notisSchema';



export const createNewTask = async(req: Request, res: Response) => {
    try {

        const task = new Task( req.body )
        await task.save()

        return res.json({
            task,
            message: 'Task created'
        });

    } catch (error) {
        console.log(req.body)
        return res.status(400).json({
            message: 'Internal Server error',
            error
        })
    }
}; 


export const getTask = async(req: Request, res: Response) => {

    const { id } = req.params
    const tasks = await Task.find({ createdBy: id }).sort({ createdAt: -1 });

    res.json({
        tasks
    })
}; 



export const putTask = async(req: Request, res: Response) => {
    

    try {

        const { _id, ...rest } = req.body

        const task = await Task.findByIdAndUpdate( req.params.id, rest )

        res.json({
            msg: 'Proyect Updated',
            task
        });


    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }

}; 


export const deleteTask = async(req: Request, res: Response) => {


    try {

        const projectId = req.params.id
        console.log(projectId)

        const task = await Project.findById( projectId )

        

        if(!task) return res.status(400).json({
            msg: 'The project dont exist'
        })

        // Verificar si el usuario autenticado es el creador del proyecto
        if (task.createdBy.toString() !== req.uid ) {
            return res.status(403).json({ msg: 'User not authorized' });
        }


        const projectDeleted = await Project.findByIdAndDelete( projectId )


        res.json({
            projectDeleted
        });

    } catch (error) {
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }

}; 


export const completeTask = async(req: Request, res: Response) => {


    try {

        const { _id, ...rest } = req.body

        const task = await Project.findByIdAndUpdate( req.params.id, rest )

        res.json({
            msg: 'Proyect Updated',
            task
        });
    
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }

}


export const getTasksByRepo = async(req: Request, res: Response) => {

    const { repoID } = req.params

    const tasks = await Task.find({ repository_related_id: repoID});
    // console.log(tasks)
    // console.log(repoID)

    res.json({
        tasks
    });


}



export const getProyectTasksDataForHeatMap = async (req: Request, res: Response) => {
    const { projectID } = req.params;
    const { owner, tasks } = req
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número

    try {

        if( owner && owner === true ) {
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

            const tasks = await Task.find(matchCondition)
                    .select('-hash')
                    .sort({ createdAt: -1 });
                    
            return res.json({
                tasks
            });
        } else {
            return res.json({
                tasks
            });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

export const getTasksByProject = async (req: Request, res: Response) => {
    const { projectID } = req.params;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    const { owner, completedTasks, approvalTasks } = req;

    try {
        if( owner && owner === true ) {
            console.log('Entrando al owner')
            let matchCondition1 = { project: projectID, status: { $in: ['completed', 'approval'] } };
            if (year) {
                matchCondition1 = { 
                ...matchCondition1,
                updatedAt: {
                    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                }
                };
            }

            const tasks = await Task.find(matchCondition1)
                    .sort({ createdAt: -1 });


            const completedTasks = tasks.filter(task => task.status === 'completed');
            const approvalTasks = tasks.filter(task => task.status === 'approval');

            return res.json({
                completedTasks,
                approvalTasks

            });
        } else {

            console.log('Entrando al colaborador')

            return res.json({
                completedTasks,
                approvalTasks
            });
        }


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}




export const updateTaskStatus = async(req: Request, res: Response) => {

    const { collaborator, type, owner } = req;
    const { status, approved } = req.body;
    const { taskId } = req.params;    
    const uid = req.query.uid

    try {
        const task = await Task.findById( taskId );

        if(!task) {
            return res.status(404).json({message: 'Task not found'});          
        }

        if( !approved ){
            if( type === 'owner'){
                console.log(owner)
                await Task.updateOne({ _id: taskId }, { status: status, reasons: req.body.reasons });
                await Promise.all( task.contributorsIds.map( async (contributorId: string) => {
                    const noti = new Noti({
                        type: 'task-rejected',
                        title: 'Task rejected',
                        description: `The task "${task.task_name}" with ID ${taskId} has been rejected`,
                        from: {
                            name: owner.username,
                            ID: uid,
                            photoUrl: owner.photoUrl || null
                        },
                        recipient: contributorId,
                        additionalData: {
                            reasons: req.body.reasons
                        }
                    })
                    await noti.save()
                }))

                return res.json({
                    success: true,
                    message: 'Reasons Subbmited',
                    type: 'task-rejected'
                });
            } else {
                await Task.updateOne({ _id: taskId }, { status: status, reasons: req.body.reasons })

                await Promise.all( task.contributorsIds.map( async (contributorId: string) => {
                    const noti = new Noti({
                        type: 'task-rejected',
                        title: 'Task rejected',
                        description: `The task "${task.task_name}" with ID ${taskId} has been rejected`,
                        from: {
                            name: collaborator.name,
                            ID: collaborator.uid,
                            photoUrl: collaborator.photoUrl || null
                        },
                        recipient: contributorId,
                        additionalData: {
                            reasons: req.body.reasons
                        }
                    })
                    await noti.save()
                }))

                return res.json({
                    success: true,
                    message: 'Reasons Subbmited',
                    type: 'task-rejected'
                });
            }
        } else {
            if( type === 'owner'){
                console.log(owner)
                await Task.updateOne({ _id: taskId }, { status: status });
                
                await Promise.all( task.contributorsIds.map( async (contributorId: string) => {
                    const noti = new Noti({
                        type: 'task-approved',
                        title: 'Task approved',
                        description: `The task "${task.task_name}" with ID ${taskId} has been approved`,
                        from: {
                            name: owner.username,
                            ID: uid,
                            photoUrl: owner.photoUrl || null
                        },
                        recipient: contributorId
                    })
                    await noti.save()
                }))

                return res.json({
                    success: true,
                    message: 'Task Approved',
                    type: 'task-approved'
                });
            } else {
                await Task.updateOne({ _id: taskId }, { status: status });        
                await Promise.all( task.contributorsIds.map( async (contributorId: string) => {
                    const noti = new Noti({
                        type: 'task-approved',
                        title: 'Task approved',
                        description: `The task "${task.task_name}" with ID ${taskId} has been approved`,
                        from: {
                            name: collaborator.name,
                            ID: collaborator.uid,
                            photoUrl: collaborator.photoUrl || null
                        },
                        recipient: contributorId
                    })
                    await noti.save()
                }))

                return res.json({
                    success: true,
                    message: 'Task Approved',
                    type: 'task-approved'
                });
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    };
}