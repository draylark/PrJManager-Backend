import { Request, Response } from 'express';
import multer from 'multer';
import nodegit from 'nodegit';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import Repo from '../models/repoSchema';
import Collaborator from '../models/collaboratorSchema';



export const createRepository = async (req: Request, res: Response) => {

    console.log('llegue hasta createRepository')
    try {

        res.status(200).json({
            success: true,
            message: 'Repository created successfully'
        });
    } catch (error) {
        console.log('aqui la request fallo')
        res.status(400).json({ message: error.message });
    }
};

// READ
export const getRepositories = async (req: Request, res: Response) => {
    res.json({
        message: 'Hola'
    })
    // try {
    //     const repositories = await Repo.find();
    //     res.status(200).json(repositories);
    // } catch (error) {
    //     res.status(500).json({ message: error.message });
    // }
};



export const getRepositoryById = async (req: Request, res: Response) => {
    try {
        const repository = await Repo.findById(req.params.id);
        if (repository) {
            res.status(200).json(repository);
        } else {
            res.status(404).json({ message: 'Repository not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// UPDATE
export const updateRepository = async (req: Request, res: Response) => {
    // const { repoID } = req.params;
    // const { creatingMiddlewareState, updatingMiddlewareState, deletingMiddlewareState} = req
    // const { collaborators, modifiedCollaborators, deletedCollaborators, newCollaborators, newDefaultBranch, ...rest } = req.body;        

    // const message = `${creatingMiddlewareState || updatingMiddlewareState || deletingMiddlewareState ? 
    //                 `Collaborators and repository updated successfully. ${newDefaultBranch ? 'Default branch changed.' : ''}`  : 
    //                 'Repository updated successfully'} ${newDefaultBranch ? ' and default branch changed.' : ''}   
    // `

    // try {
    //     if( newDefaultBranch !== null ){
    //         const repository = await Repo.findByIdAndUpdate(repoID, {...rest, defaultBranch: newDefaultBranch }, { new: true });
    //         res.status(200).json({
    //             success: true,
    //             message,
    //             repository
    //         });
    //     } else {
    //         const repository = await Repo.findByIdAndUpdate(repoID, rest, { new: true });
            res.status(200).json({
                success: true,
                message: 'Repository updated successfully'
                // message,
                // repository
            });
        // }        
    // } catch (error) {
    //     return res.status(500).json({ message: error.message });
    // }
};

// DELETE
export const deleteRepository = async (req: Request, res: Response) => {
    try {
        const repository = await Repo.findByIdAndDelete(req.params.id);
        if (repository) {
            res.status(200).json(repository);
        } else {
            res.status(404).json({ message: 'Repository not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateRepos = async (req: Request, res: Response) => {

    const { modifiedRepos } = req.body;

    if (!modifiedRepos || modifiedRepos.length === 0) {
        return res.status(200).json({
            msg: 'No hay repositorios modificados'
        });
    }

    try {

        if (modifiedRepos.length > 0) {
            await Promise.all(modifiedRepos.map(async (repo) => {
              if (repo.collaborators && repo.collaborators.length > 0) {

                    await Promise.all(repo.collaborators.map(async (collaborator) => {
                        const existingCollaborator = await Collaborator.findOne({
                            repository: repo.repoId,
                            user: collaborator.id
                        });

                        if (existingCollaborator) {
                            await Collaborator.findByIdAndUpdate(existingCollaborator._id, {
                                accessLevel: collaborator.accessLevel
                            });
                        } else {
                            const newRepoCollaborator = new Collaborator({
                                repository: repo.repoId,
                                user: collaborator.id,
                                accessLevel: collaborator.accessLevel
                            });
                            await newRepoCollaborator.save();
                        }
                    }));

                }
            }));
          }

        res.status(200).json({ msg: 'Repositorios actualizados correctamente' });

    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar los repositorios', error });
    }
}


export const getRepoCollaborators = async (req: Request, res: Response) => {
    const { repoId } = req.params;

    try {
        const collaborators = await Collaborator.find({ 'repository._id': repoId, state: true });
        res.status(200).json({
            collaborators
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getRepositoriesByUserId = async (req: Request, res: Response) => {
    
    const { userId } = req.params;

    try {
        const repository = await Repo.find({ owner: userId });
        if (repository) {
            res.status(200).json(repository);
        } else {
            res.status(404).json({ message: 'No repositories yet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const addRepoCollaborators = async (req: Request, res: Response) => {

    const { repoId, collaborators } = req.body;

    if (!repoId || !collaborators || collaborators.length === 0) {
        return res.status(200).json({
            msg: 'No hay colaboradores que agregar'
        });
    }

    try {
        await Promise.all(collaborators.map(async (collaborator) => {
            const existingCollaborator = await Collaborator.findOne({
                repository: repoId,
                user: collaborator.id
            });

            if (existingCollaborator) {
                await Collaborator.findByIdAndUpdate(existingCollaborator._id, {
                    accessLevel: collaborator.accessLevel
                });
            } else {
                const newRepoCollaborator = new Collaborator({
                    repository: repoId,
                    user: collaborator.id,
                    accessLevel: collaborator.accessLevel
                });
                await newRepoCollaborator.save();
            }
        }));

        res.status(200).json({ msg: 'Colaboradores agregados correctamente' });

    } catch (error) {
        res.status(500).json({ msg: 'Error al agregar los colaboradores', error });
    }

}


export const addRepoCollaborator = async (req: Request, res: Response) => {
    const { uid, project, layer, repository } = req.body;

    try {
        // Crear un objeto con la información del colaborador
        const collaboratorData = {
            uid
        };

        if( project && project._id ) {
            collaboratorData.project = { _id: project._id, accessLevel: project.accessLevel };
        }

        // Agregar layer y repository si están presentes y son válidos
        if (layer && layer._id) {
            collaboratorData.layer = { _id: layer._id, accessLevel: layer.accessLevel };
        }
        if (repository && repository._id) {
            collaboratorData.repository = { _id: repository._id, accessLevel: repository.accessLevel };
        }

        const newCollaborator = new Collaborator(collaboratorData);
        await newCollaborator.save();

        res.status(200).json({ msg: 'Colaborador agregado correctamente', colaborador: newCollaborator });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                msg: 'Error de validación al agregar el colaborador',
                errores: error.errors
            });
        }
        res.status(500).json({ msg: 'Error al agregar el colaborador', error: error.message });
    }
};




export const getReposByProject = async (req: Request, res: Response) => {
    const { projectID } = req.params;
    const { owner, repos } = req;

    try {     
        if( owner && owner === true){
            const repos = await Repo.find({ projectID: projectID });
            res.status(200).json({
                success: true,
                repos
            });
        } else {
            res.status(200).json({
                success: true,
                repos
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }

};