import { Request, Response, NextFunction } from 'express';
import Collaborator from '../models/collaboratorSchema';


export const updatingCollaborators = async (req: Request, res: Response, next: NextFunction) => {
    const { layerID } = req.params;
    const { modifiedCollaborators } = req.body;

    console.log(modifiedCollaborators)

    if(modifiedCollaborators.length === 0) {
        return next();
    }
    
    try {
        await Promise.all(modifiedCollaborators.map(collaborator =>
            Collaborator.findOneAndUpdate({ uid: collaborator.id, 'layer._id': layerID }, { $set: { 'layer.accessLevel': collaborator.accessLevel } } )
        ));

        console.log('Collaborators updated')
        req.collaboratorsUpdated = true;

        next();
    } catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Es buena práctica dar más contexto sobre el error
        });
    }
};


export const addNewLayerCollaborators = async (req: Request, res: Response, next: NextFunction) => {

    const { layerNewCollaborators, projectID, projectAccessLevel } = req.body;

    if(layerNewCollaborators.length === 0) {
        return next();
    }

    try {
        await Promise.all(layerNewCollaborators.map(collaborator => {
            const collaboratorData = {
                layer: {
                    _id: collaborator.layerID,
                    accessLevel: collaborator.accessLevel,
                },
            };
    
            const newCollaborator = new Collaborator(collaboratorData);
            return newCollaborator.save();
        }));
    
        req.collaboratorsAdded = true;

        next();
    } catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }
}



export const addNewRepoCollaborators = async (req: Request, res: Response, next: NextFunction) => {

    const { collaborators, projectID, layerID } = req.body;
    const { repoID } = req

    if(collaborators.length === 0) {
        return next();
    }

    try {
        await Promise.all(collaborators.map(collaborator => {
            const collaboratorData = {
                repository: {
                    _id: repoID,
                    accessLevel: collaborator.accessLevel,
                },
                uid: collaborator.id,
                name: collaborator.name,
                photoUrl: collaborator.photoUrl
            };
    
            const newCollaborator = new Collaborator(collaboratorData);
            return newCollaborator.save();
        }));
    
        req.collaboratorsAdded = true

        next();
    } catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message, // Proporcionar más información sobre el error puede ser útil
        });
    }

}