import { Response, Request } from 'express'
import * as nodegit from 'nodegit';
import Project from '../models/projectSchema';
import Collaborator from '../models/collaboratorSchema';
import User from '../models/userSchema';
import Task from '../models/taskSchema';
import fs from 'fs';
import path from 'path';
import Readme from '../models/readmeSchema';
import Commit from '../models/commitSchema';
import Noti from '../models/notisSchema';

export const getProjects = async(req: Request, res: Response) => {
    const { uid } = req.params;

    try {
        const myProjects = await Project.find({ owner: uid })
        const collaboratorProjects = await Collaborator.find({ uid, state: true, 'project._id': { $exists: true } })
                                                        .populate('project._id')
                                                        .lean();

        const projectsFromCollaborators = collaboratorProjects.reduce((acc, collaborator) => {
            // Desestructura para obtener el documento del proyecto poblado y el nivel de acceso directamente.
            const { _id: { _id, ...rest }, accessLevel } = collaborator.project;
        
            // Verifica si hay contenido relevante para agregar al acumulador.
            if (rest) {
                // Combina la información del proyecto poblado con el nivel de acceso y lo agrega al acumulador.
                acc.push({ pid: _id, ...rest, accessLevel });
            }
            
            // Retorna el acumulador para la siguiente iteración.
            return acc;
        }, []); // Inicia con un array vacío como valor acumulado.

        res.json([ ...myProjects, ...projectsFromCollaborators ]);
        
    } catch (error) {
        res.status(400).json({
            msg: 'Internal Server error',
            error
        });
    }
};


export const postProject = async(req: Request, res: Response) => {

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


export const getProject = async(req: Request, res: Response) => {

    const { userId } = req.params

    if( !userId ) return res.status(400).json({
        msg: 'User id is required'
    });

    const projects = await Project.find({ owner: userId })

    res.json({
        projects
    })
}; 



export const getProjectById = async(req: Request, res: Response) => {

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



export const updateProject = async(req: Request, res: Response) => {
    
    const { projectID } = req.params;
    const values = req.body;

    try {  
        const project = await Project.findByIdAndUpdate( projectID, { ...values, lastUpdated: Date.now() }, { new: true } )
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project
        })
    } catch (error) {      
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }
}; 


export const deleteProject = async(req: Request, res: Response) => {


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



export const getCollaborators = async(req: Request, res: Response) => {
    const { projectID } = req.params

    try {
        const collaborators = await Collaborator.find({'project._id': projectID, state: true })

        res.json({
            collaborators
        })
    } catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
        })
    };
};



export const getReadme = async(req: Request, res: Response) => {
    const { readmeID } = req.params;

    try {
        const readme = await Readme.findById( readmeID );
        res.json({
            readmeContent: readme.content
        });
    } catch (error) {
        res.status(400).json({
            message: 'Internal Server error',
            error
    });
    }
}



export const response = async(req: Request, res: Response) => {
    const {
        invMiddlewareState,
        updatingMiddlewareState,
        deletingMiddlewareState,
        totalDeletedCollaborators
    } = req;

    const requestStatus = req.query.requestStatus;

    let messageParts = []; // Para acumular partes del mensaje basado en las operaciones realizadas

    // Crear mensajes según el estado de cada operación
    if (deletingMiddlewareState) {
        messageParts.push(`${totalDeletedCollaborators} collaborator(s) deleted.`);
    } 

    if (updatingMiddlewareState) {
        messageParts.push("Collaborators updated successfully.");
    } 

    if( invMiddlewareState ) {
        messageParts.push("Invitation(s) sent.");
    }

    if ( requestStatus && requestStatus === 'accept' ) {
        messageParts.push("Invitation accepted.");
    }

    if ( requestStatus && requestStatus === 'reject' ) {
        messageParts.push("Invitation rejected.");
    }

    // Construir el mensaje final
    const finalMessage = messageParts.join(' ');

    // Enviar la respuesta
    res.json({
        success: true,
        message: finalMessage
    });
};



export const getProjectActivityData = async(req: Request, res: Response) => {
    const { projectID } = req.params;

    try {
        const commits = await Commit.find({ project: projectID })
                .select('-hash')
                .sort({ createdAt: -1 });

        const tasks = await Task.find({ project: projectID })
                .sort({ createdAt: -1 });

        res.json({
            commits,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};





export const handlePrJCollaboratorInvitation = async( req: Request, res: Response, ) => {
    const { projectID } = req.params;
    const { uid, name, photoUrl, accessLevel, notiID } = req.body;
    const { requestStatus } = req.query

    try {
        if( requestStatus === 'accept' ) {
            const existingCollaborator = await Collaborator.findOne({ uid, 'project._id': projectID });

            if (existingCollaborator) {
                if (!existingCollaborator.state) {
                    await Collaborator.updateOne({ uid, 'project._id': projectID }, { $set: { state: true, name, photoUrl, 'project.accessLevel': accessLevel } });
                    await Noti.findByIdAndUpdate ( notiID, { status: false } );

                    return res.json({
                        message: 'Collaborator added successfully'
                    });
                }
            } else {
                const c = new Collaborator({ uid, name, photoUrl, project: { _id: projectID, accessLevel }, state: true });
                await c.save();

                return res.json({
                    message: 'Collaborator added successfully'
                });
            }
        } else {
            await Noti.findByIdAndUpdate( notiID, { status: false } );

            return res.json({
                message: 'Invitation rejected'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }


}