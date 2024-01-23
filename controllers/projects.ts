import { Response, Request } from 'express'
import * as nodegit from 'nodegit';
import Project from '../models/projectSchema';
import User from '../models/userSchema';
import Task from '../models/taskSchema';
import fs from 'fs';
import path from 'path';


const postProject = async(req: Request, res: Response) => {

    const { name, ...rest  } = req.body
    if( !name || !rest.description || !rest.endDate ) return res.status(400).json({
        msg: 'Faltan campos por llenar'
    })

    


    const project = await Project.find({ name })
    if(project.length > 0) return res.status(400).json({
        msg: 'This project\'s name already exist, choose another one'
    })


    try {
        const project = new Project( { name, ...rest } )
        await project.save()

        const updatedUser = await User.findByIdAndUpdate( 
            req.uid,
            { $push: { createdProjects: project._id } }, 
            { new: true } )

        const projectRepoDir = path.join(__dirname, '..', '..', 'repos', `${project._id}`);

        if (!fs.existsSync(projectRepoDir)) {
            fs.mkdirSync(projectRepoDir);
        }
        res.json({
            project,
            updatedUser,
            msg: 'Proyect created'
        })
    } catch (error) {
        console.log(rest)
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }

}; 


const getProject = async(req: Request, res: Response) => {

    const { userId } = req.params

    if( !userId ) return res.status(400).json({
        msg: 'User id is required'
    });

    const projects = await Project.find({ owner: userId })

    res.json({
        projects
    })
}; 



const getProjectById = async(req: Request, res: Response) => {

    const { projectId } = req.params

    console.log(projectId)


    try {

        if( !projectId ) return res.status(400).json({
            msg: 'Project id is required'
        });

        const project = await Project.findById( projectId );

        return res.json({
            project
        });

    } catch (error) {
        return res.json({
            msg: 'Internal Server error',
            error
        })
    }

}; 



const putProject = async(req: Request, res: Response) => {
    
    const { projectId } = req.params
    console.log(req.body)

    if( !projectId ) return res.status(400).json({
        msg: 'Project id is required'
    });

    try {  
        const project = await Project.findByIdAndUpdate( projectId, req.body, { new: true } )
        res.status(200).json({
            project
        })
    } catch (error) {      
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }



}; 


const deleteProject = async(req: Request, res: Response) => {


    try {

        const projectId = req.params.id
        console.log(projectId)

        const project = await Project.findById( projectId )

        

        if(!project) return res.status(400).json({
            msg: 'The project dont exist'
        })

        // Verificar si el usuario autenticado es el creador del proyecto
        if (project.owner.toString() !== req.uid ) {
            return res.status(403).json({ msg: 'User not authorized' });
        }


        const projectDeleted = await Project.findByIdAndDelete( projectId )


        res.json({
            projectDeleted
        });

    } catch (error) {
        console.log(error)
    }

}; 




const calculateProjectProgress = async(req: Request, res: Response) => {

    const { projectId } = req.params

    console.log(projectId)

    try {

        if( !projectId ) return res.status(400).json({
            msg: 'Project id is required'
        });


        const tasks = await Task.find({ projectId });



        const totalTasks: number = tasks.length
        const completedTasks: number = tasks.filter( task => task.status === 'Done' ).length
        const progress: number = totalTasks ? (completedTasks / totalTasks) * 100 : 0

        res.json({
            progress
        });

    } catch (error) {
        console.error('Error calculating project progress:', error );
        res.status(500).json({ error: 'Hubo un error al calcular el progreso del proyecto' });
    }



}




export {
    postProject,
    getProject,
    putProject,
    deleteProject,
    calculateProjectProgress,
    getProjectById
}