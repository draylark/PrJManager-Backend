import { Response, Request } from 'express'
import Project from '../models/projectSchema';
import Task from '../models/taskSchema';



const postTask = async(req: Request, res: Response) => {

    const { name, description, projectId, createdBy, parentId, dueDate, endDate  } = req.body

    const project = await Project.findById( projectId )
   
    if(!project) return res.status(400).json({
        msg: 'This project doesnt exist or is it no longer active'
    });

    if( !name || !description || !projectId || !createdBy ) return res.status(400).json({
        msg: 'Faltan campos por llenar'
    });


    try {

        // console.log(req.body)
        const thereIsParentId = parentId.length > 1 ? parentId : null
        const task = new Task( { name, description, projectId, createdBy, parentId: thereIsParentId, dueDate, endDate  } )
        await task.save()

        const updatedProject = await Project.findByIdAndUpdate( 
            projectId,
            { $push: { tasks: task._id } }, 
            { new: true } )

        return res.json({
            task,
            updatedProject,
            msg: 'Task created'
        });

    } catch (error) {
        console.log(req.body)
        return res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }




}; 


const getTask = async(req: Request, res: Response) => {

    const { id } = req.params
    const tasks = await Task.find({ createdBy: id }).sort({ createdAt: -1 });

    res.json({
        tasks
    })
}; 



const putTask = async(req: Request, res: Response) => {
    

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


const deleteTask = async(req: Request, res: Response) => {


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


const completeTask = async(req: Request, res: Response) => {


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


const getTasksByProject = async(req: Request, res: Response) => {

    const { projectId } = req.params

    const tasks = await Task.find({ projectId });

    res.json({
        tasks
    });


}


export {
    postTask,
    getTask,
    putTask,
    deleteTask,
    getTasksByProject
}