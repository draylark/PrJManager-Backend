import { Response, Request } from 'express'
import Project from '../models/projectSchema';
import Collaborator from '../models/collaboratorSchema';
import Task from '../models/taskSchema';
import Readme from '../models/readmeSchema';
import Commit from '../models/commitSchema';
import Noti from '../models/notisSchema';
import { C_On_Project, Project_i } from '../interfaces/interfaces';
import { Types } from 'mongoose';

interface CollabOnProject extends Omit<Project_i, '_id'> {
    pid: Types.ObjectId,
    accessLevel: string
}


export const getProjects = async(req: Request, res: Response) => {
    const { uid } = req.params;

    try {
        const myProjects = await Project.find({ owner: uid })
        const collaboratorProjects: C_On_Project[] = await Collaborator.find({ uid, state: true, 'project._id': { $exists: true } })
                                                        .populate('project._id')
                                                        .lean();

        const projectsFromCollaborators: CollabOnProject[] = collaboratorProjects.reduce<CollabOnProject[]>((acc, collaborator) => {
            const { _id: { _id, ...rest }, accessLevel } = collaborator.project;
            if (rest) {
            const data = { pid: _id, ...rest, accessLevel } as CollabOnProject;
                acc.push(data);
            }
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

    const { project } = req
    const { readmeContent } = req.body

    try {
        const readme = new Readme({ project: project?._id, content: readmeContent })
        await readme.save()

        await Project.findByIdAndUpdate( project?._id, { readme: readme._id }, { new: true } )

        res.json({
            project,
            message: 'Your project has been created successfully!'
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Internal Server error',
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
   
    const { accessLevel } = req
    const { projectID } = req.params

    try {
        if( !projectID ) return res.status(400).json({
            success: false,
            message: 'Project id is required'
        });

        const project = await Project.findById( projectID )

        return res.json({
            project, 
            accessLevel: accessLevel ? accessLevel : null
        });

    } catch (error) {
        return res.json({
            message: 'Internal Server error',
            error
        })
    };
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
            readmeContent: readme?.content
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

    let messageParts: string[] = []; // Para acumular partes del mensaje basado en las operaciones realizadas

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



export const prjInvitationCallback = async(req: Request, res: Response) => {
    const { requestStatus } = req.body
    try {
        if( requestStatus === 'accept') {
            res.json({
                message: 'Invitation accepted',
                accepted: true
            });
        } else {
            res.json({
                message: 'Invitation rejected',
                accepted: false
            });
        }  
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });      
    }
}


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



export const getMyProjectTimelineActivity = async( req: Request, res: Response ) => {

    const { projectId } = req.params
    const { uid } = req.query

}

export const getProfileTopProjects = async(req: Request, res: Response) => {
    const { uid } = req.params;

    try {
        // Obtén todos los proyectos del usuario
        const projects = await Project.find({ owner: uid, visibility: 'public' })
                                .select('name commits _id description updatedAt')

        // Ordena los proyectos por la cantidad de commits en orden descendente
        const sortedProjects = projects.sort((a, b) => b.commits - a.commits);

        // Selecciona los primeros tres proyectos
        const topProjects = sortedProjects.slice(0, 3);

        res.json({
            success: true,
            topProjects: topProjects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server error',
            error
        });
    }
};


export const getProfilePublicProjects = async(req: Request, res: Response) => {
    const { uid } = req.params

    try {
        const projects = await Project.find({ owner: uid, visibility: 'public' })
                                .select('name commits layers repositories completedTasks _id description updatedAt')

        res.json({
            success: true,
            projects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server error',
            error
        });
    }
}