import { Response, Request } from 'express'
import Project from '../models/projectSchema';
import Task from '../models/taskSchema';
import Noti from '../models/notisSchema';
import path from 'path';
import Note from '../models/noteSchema';



export const createNewTask = async(req: Request, res: Response) => {

    const { assigned_to, ...rest } = req.body
    const { repo } = req

    try {

        const task = new Task( assigned_to ? { ...rest, assigned_to } : rest )
        await task.save()

        if( assigned_to ) {
            const noti = new Noti({
                type: 'task-assignation',
                title: 'Task assignation',
                description: `You have been assigned to the task "${task.task_name}"`,
                from: {
                    name: 'System',
                    ID: task.project
                },
                recipient: assigned_to,
                additionalData: {
                    date: new Date(),
                    taskName: task.task_name,
                    taskId: task._id,
                    repositoryName: repo.name
                }
            })
            await noti.save()
        }

        return res.json({
            task,
            message: 'Task created'
        });

    } catch (error) {
        console.log(req.body)
        console.log(error)
        return res.status(400).json({
            message: 'Internal Server error',
            error
        })
    }
}; 




export const getTaskById = async(req: Request, res: Response) => {

    const { taskId } = req.params

    try {

        const task = await Task.findById(taskId)
        res.json(task)

    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })

    }

};





export const getTaskCommits = async(req: Request, res: Response) => {

    const { task, commits } = req


    try {
        res.json({
            task,
            commits
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
        
    }
}


export const getTasks = async(req: Request, res: Response) => {

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

    console.log('repoID',repoID)

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

export const getRepoTasksDataForHeatMap = async (req: Request, res: Response) => {
    const { repoID } = req.params;
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número

    try {

            let matchCondition = { repository_related_id: repoID, status: 'completed' };
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

    const { authorized, type } = req;
    const { status, approved, reasons } = req.body;
    const { taskId, projectID } = req.params;    
    const uid = req.query.uid


    try {
        const task = await Task.findById( taskId )
                            .populate('repository_related_id', 'name')

        if(!task) {
            return res.status(404).json({message: 'Task not found'});          
        }

        if(type === 'authorized'){
            if( !approved ){         
                    const formattedReasons = reasons.map(reason => ({
                        uid: uid,
                        text: reason,
                        date: new Date(), // Puedes ajustar la fecha si viene del body o si prefieres usar la fecha actual
                        taskSubmissionDate: task.reviewSubmissionDate
                    }));
                    
                    await Task.updateOne(
                        { _id: taskId },
                        { $push: { reasons_for_rejection: { $each: formattedReasons } }, status: status, reviewSubmissionDate: null }            
                    );

                    await Promise.all( task.contributorsIds.map( async (contributorId: string) => {
                        const noti = new Noti({
                            type: 'task-rejected',
                            title: 'Task rejected',
                            description: `The task "${task.task_name}" with ID "${taskId}" has been rejected.`,
                            from: {
                                name: 'System',
                                ID: projectID
                            },
                            recipient: contributorId,
                            additionalData: {
                                date: new Date(),
                                reasons: req.body.reasons,
                                repoName: task.repository_related_id.name,
                                taskName: task.task_name,
                                taskId: taskId
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
                    await Task.updateOne({ _id: taskId }, { status: status, completed_at: new Date() });
                    await Project.updateOne({ _id: projectID }, { $inc: { completedTasks: 1 } })
                    
                    await Promise.all( task.contributorsIds.map( async (contributorId: string) => {
                        const noti = new Noti({
                            type: 'task-approved',
                            title: 'Task approved',
                            description: `The task "${task.task_name}" with ID "${taskId}" has been approved.`,
                            from: {
                                name: 'System',
                                ID: projectID,
                            },
                            recipient: contributorId,
                            additionalData: {
                                date: new Date(),
                                repositoryName: task.repository_related_id.name, 
                                taskName: task.task_name,
                                taskId: taskId
                            }
                        })
                        await noti.save()
                    }))

                    return res.json({
                        success: true,
                        message: 'Task Approved',
                        type: 'task-approved'
                    });   
            }
        } else {
            return res.status(403).json({
                message: 'User not authorized to update task status'
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    };
}


export const sendTaskToRevision = async(req: Request, res: Response) => {
    const { taskId } = req.params;

    try {
        await Task.updateOne(
            { _id: taskId },
            {
              $set: {
                status: 'approval',
                reviewSubmissionDate: new Date()
              },
              $push: {
                reviewSubmissionDates: new Date()
              }
            }
          );

        res.status(200).json({
            message: 'The task has been submitted for review.'
        });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', error });
    }
}




export const getUserTasks = async(req: Request, res: Response) => {
    const { uid } = req.params;

    try {
        const tasks = await Task.find({ assigned_to: uid })
            .sort({ createdAt: -1 })
            .select('_id repository_number_task  priority goals type deadline task_name task_description assigned_to status')


        const contributions = await Task.find({ contributorsIds: uid })
            .sort({ createdAt: -1 })
            .select('_id repository_number_task priority goals type deadline task_name task_description assigned_to status')

        // Combina las tareas y contribuciones
        const combinedTasks = [...tasks, ...contributions];

        // Filtra para obtener un conjunto único basado en `_id`
        const uniqueTasks = combinedTasks.filter(
            (task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index
        );

        res.json({
            tasks: uniqueTasks,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            type: 'server-error'
        });
    }
    
}


export const getTopProjectsTasks = async (req: Request, res: Response) => {
    const { uid } = req.params;
    const { user: { topProjects } } = req
    const projectIds = topProjects.map( project => project._id );
    
    if(topProjects.length === 0) {
        return res.status(404).json({
            message: "You haven't set any project as 'Top Project', highlight one in the 'Top Projects' panel to track it.",
            type: 'no-top-projects'
        });
    }


    try {
        const tasks = await Task.find({ assigned_to: uid, project: { $in: projectIds }})
            .sort({ createdAt: -1 })
            .populate('layer_related_id repository_related_id project')
            .populate({
                path: 'contributorsIds',
                select: '_id username photoUrl' // Incluye solo 'name' y 'email', excluye '_id'
            });



        const contributions = await Task.find({ contributorsIds: uid, project: { $in: projectIds } })
            .sort({ createdAt: -1 })
            .populate('layer_related_id repository_related_id project')
            .populate({
                path: 'contributorsIds',
                select: '_id username photoUrl' // Incluye solo 'name' y 'email', excluye '_id'
            });

        // Combina las tareas y contribuciones
        const combinedTasks = [...tasks, ...contributions];

        // Filtra para obtener un conjunto único basado en `_id`
        const uniqueTasks = combinedTasks.filter(
            (task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index
        );

        res.json({
            tasks: uniqueTasks,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            type: 'server-error'
        });
    }


};


export const getTasksForDashboard = async (req: Request, res: Response) => {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;


    // Crear un objeto de filtro base que incluye el usuario asignado.
    let assignedfilter = { assigned_to: uid, status: 'completed' };
    let contributionsFilter = { contributorsIds: uid, status: 'completed' };

    // Añadir filtros de fecha si se proporcionan ambos startDate y endDate.
    if (startDate && endDate) {
        assignedfilter['updatedAt'] = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };

        contributionsFilter['updatedAt'] = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const tasks = await Task.find(assignedfilter)
        .sort({ updatedAt: -1 })
        .select('_id task_name updatedAt')

    const contributions = await Task.find(contributionsFilter)
        .sort({ updatedAt: -1 })
        .select('_id task_name updatedAt')


    const combinedTasks = [...tasks, ...contributions];

    const uniqueTasks = combinedTasks.filter(
        (task, index, self) => self.findIndex(t => t._id.toString() === task._id.toString()) === index
    );

    res.json({
        tasks: uniqueTasks,
    });
};


export const getTaskNotes = async(req: Request, res: Response) => {
    const { taskId } = req.params

    try {
        
        const notes = await Note.find({ task: taskId })
            .populate('uid', 'username photoUrl')
            .sort({ createdAt: -1 });

        res.json({
            notes
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
        
    }
}


export const updateNote = async(req: Request, res: Response) => {
    const { noteId } = req.params
    const { text } = req.body

    try {
        await Note.findOneAndUpdate({ _id: noteId }, { text })

        res.json({
            message: 'Note updated'
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
     })        
    }
}



export const deleteNote = async(req: Request, res: Response) => {
    const { noteId } = req.params

    try {
        await Note.findByIdAndDelete(noteId)

        res.json({
            message: 'Note deleted'
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
    }
}


export const getTaskContributors = async(req: Request, res: Response) => {
    const { data } = req

    try {
        res.json({
            contributorsData: data
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
    }
};


export const updateTaskContributors = async(req: Request, res: Response) => {
    const { uid } = req.query;
    const { taskId } = req.params;
    const { contributorsIds } = req.body;

    try {
        const task = await Task.findById(taskId)
                            .select('assigned_to type _id task_name repository_related_id')
                            .populate('assigned_to', 'username photoUrl _id')
                            .populate('repository_related_id', 'name');


        if (!task) {
            return res.status(400).json({
                message: 'Task not found'
            });
        }

        // Verificar si el usuario es el asignado a la tarea y si la tarea está en estado 'assigned'
        if (task.type === 'assigned' && task.assigned_to._id.toString() === uid) {
            // Actualizar la lista de contributorsIds utilizando $addToSet para evitar duplicados

            await Promise.all( contributorsIds.map( async (contributorId: string) => {
                const noti = new Noti({
                    type: 'task-invitation',
                    title: 'Task invitation',
                    description: `You have been invited to participate in the assigned task`,
                    from: {
                        ID: task.assigned_to._id,
                        name: task.assigned_to.username,     
                        photoUrl: task.assigned_to.photoUrl || null
                    },
                    recipient: contributorId,
                    additionalData: {
                        taskId,
                        taskName: task.task_name,
                        repositoryName: task.repository_related_id.name
                    }
                })
                await noti.save()
            }))

            res.json({
                message: 'Invitation(s) sent successfully.'
            });
        } else {
            res.status(403).json({
                message: 'User not authorized to update contributors.'
            });
        }
    } catch (error) {
        console.error('Error updating task contributors:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
};




export const deleteTaskContributor = async(req: Request, res: Response) => {
    const { uid } = req.query;
    const { taskId } = req.params;
    const { contributorId } = req.body;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(400).json({
                message: 'Task not found'
            });
        }

        // Verificar si el usuario es el asignado a la tarea y si la tarea está en estado 'assigned'
        if (task.type === 'assigned' && task.assigned_to.toString() === uid) {
            // Eliminar el contributorId de la lista de contributorsIds
            await Task.updateOne(
                { _id: taskId },
                { $pull: { contributorsIds: contributorId } }
            );

            res.json({
                message: 'Contributor removed successfully'
            });
        } else {
            res.status(403).json({
                message: 'User not authorized to remove contributor'
            });
        }
    } catch (error) {
        console.error('Error removing task contributor:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
};



export const handleTaskInvitation = async(req: Request, res: Response) => {

    const { taskId} = req.params
    const { uid, accepted, notiId } = req.body

    try {
        if(accepted){
            await Task.findOneAndUpdate({ _id: taskId }, { $addToSet: { contributorsIds: uid } })
            await Noti.findOneAndUpdate({ _id: notiId }, { status: false })

            return res.json({
                message: 'Invitation accepted'
            })
        } else {
            await Noti.findOneAndDelete({ _id: notiId })
            return res.json({
                message: 'Invitation rejected succesfully.'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
    }
}



export const getProfileTasks = async(req: Request, res: Response) => {
    const { tasks } = req

    try {
        res.json({
            tasks
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
    }
};