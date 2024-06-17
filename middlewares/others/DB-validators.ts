import { Request, Response, NextFunction } from 'express';
import Layer from '../../models/layerSchema';
import Project from '../../models/projectSchema';
import Repo from '../../models/repoSchema';


export const validateProjectExistance = async (req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.body;

    try {
        if(!projectID) res.status(400).json({ 
            message: 'Project not found' 
        });

        const project = await Project.findById(projectID)

        if(!project) return res.status(400).json({ 
            success: false,
            message: 'Project not found, the repository cannot be created if the project was deleted or closed, please check if the project exists or consult with the owner of the project, if the error persists, please report the error to the PrJ Team.' 
        });

        next();
        
    } catch (error) {
        return res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });  
    };
};

export const validateLayerExistance = async (req: Request, res: Response, next: NextFunction) => {

    const { layerID } = req.body;

    try {
        if(!layerID) res.status(400).json({ 
            message: 'Layer not found' 
        });

        const layer = await Layer.findOne({ _id: layerID });

        if(!layer) res.status(400).json({ 
            success: false,
            message: 'Layer not found, the repository cannot be created if the layer was deleted or closed, please check if the layer exists or consult with the owner of the project or the layer, if the error persists, please report the error to the PrJ Team.' 
        });

        req.gitlabGroupID = layer?.gitlabId || null;

        next();
        
    } catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });  
    };
};

export const validateRepositoryExistance = async (req: Request, res: Response, next: NextFunction) => {

    const { repoID } = req.params;

    try {
        if(!repoID) res.status(400).json({ 
            message: 'Repository not found' 
        });

        const repository = await Repo.findOne({ _id: repoID });

        if(!repository) res.status(400).json({ 
            success: false,
            message: 'Repository not found, the repository cannot be created if the repository was deleted or closed, please check if the repository exists or consult with the owner of the project or the repository, if the error persists, please report the error to the PrJ Team.' 
        });

        req.repoGitlabID = repository?.gitlabId || null;

        next();
        
    } catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });  
    };

};