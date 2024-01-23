import { Request, Response } from 'express';
import multer from 'multer';
import nodegit from 'nodegit';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import Repo from '../models/repoSchema';
import Collaborator from '../models/collaboratorSchema';



export const createRepository = async (req: Request, res: Response) => {

    try {

        console.log(req.body);
        const { project, name, ...rest } = req.body;

        if (!project || !name) {
            throw new Error('Los campos project y name son requeridos');
        }

        const repoPath = path.join(__dirname, '..', '..', 'repos', project, `${name}.git`);

        if (fs.existsSync(repoPath)) {
            throw new Error('Ya existe un repositorio con ese nombre');
        }

        const repository = new Repo({ url: repoPath, project, name, ...rest });
        await repository.save();

        // Ejecutar el comando git init
   
        nodegit.Repository.init(repoPath, 1)
            .then((repo) => {
                console.log("Repositorio creado en: " + repo.workdir());
            })
            .catch((err) => {
                console.log(err);
            });

        res.status(201).json({
            repository,
            repoPath
        });
    } catch (error) {
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
    try {
        const repository = await Repo.findById(req.params.id);
        if (repository) {
            repository.set(req.body);
            await repository.save();
            res.status(200).json(repository);
        } else {
            res.status(404).json({ message: 'Repository not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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
        const collaborators = await Collaborator.find({ repository: repoId });
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
        console.log('repositoryy',repository);
        if (repository) {
            res.status(200).json(repository);
        } else {
            res.status(404).json({ message: 'No repositories yet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};