import { Request, Response } from 'express';
import Layer from '../models/layerSchema';
import Collaborator from '../models/collaboratorSchema';
import axios from 'axios';
import Project from '../models/projectSchema';


export const createLayer = async (req: Request, res: Response) => {
    const { projectID } = req.params
    const { name, description, visibility, parent_id = '80502948', creator } = req.body;

    try {
  
        const gitlabAccessToken = process.env.IDK
        console.log(gitlabAccessToken)
        const permanentVsibility = 'private'
  
        const path = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const response = await axios.post('https://gitlab.com/api/v4/groups', {
            name,
            path,
            description,
            permanentVsibility,
            parent_id,
        }, {
            headers: {
                'Authorization': `Bearer ${gitlabAccessToken}`,
            },
        });
  
        const layer = response.data
  
        const newLayer = new Layer({
          name: name,
          path: layer.path,
          description: description,
          visibility,
          project: projectID,
          creator,
          gitlabId: layer.id
        })
  
        await newLayer.save()
  
        const updatedProject = await Project.findByIdAndUpdate(
           projectID,
          { $inc: { layers: 1 } }, // Incrementa el contador de 'layers' en 1
          { new: true }
        );
  
        res.json({ 
          newLayer,
          updatedProject,
        });
  
    } catch (error) {
        console.log(error)
        console.log(error.response ? error.response.data : error.message);
        res.json({ message: error.message });
    }
};



export const getLayersByProjectId = async (req: Request, res: Response) => {
    const { projectID } = req.params;
    const { owner, layers } = req;
    const uid = req.query.uid;

    

    try {
        if( owner && owner === true ){  
            const layers = await Layer.find({ project : projectID });

            return res.status(200).json({
                msg: 'Layers by Project ID',
                total: layers.length,
                layers
            });
        } else {
            return res.status(200).json({
                msg: 'Layers by Project ID',
                total: layers.length,
                layers
            });
        }

    } catch (error) {
      return res.status(500).json({
            msg: 'Internal Server Error'
        });
    };
};


export const getLayersById = async (req: Request, res: Response) => {
    const { layerID } = req.params;

    try {
        const layer = await Layer.findById(layerID);

        return res.status(200).json({
            message: 'Layer by ID',
            layer
        });

    } catch (error) {
      return res.status(500).json({
            msg: 'Internal Server Error'
        });
    };
};



export const updateLayer = async (req: Request, res: Response) => {

    const { layerID } = req.params;
    const body = req.body;
    try {    
        await Layer.findByIdAndUpdate(layerID, body)
        res.status(200).json({
            message: 'Layer Updated'
        });   

    } catch (error) {
        res.status(500).json({
            msg: 'Internal Server Error'
        });      
    }
};


export const deleteLayer = async (req: Request, res: Response) => {
    const { layerID } = req.params;


    res.status(200).json({
        msg: 'Layer Updated',
        layerID
    });
};



export const getLayerCollaborators = async (req: Request, res: Response) => {

    const { layerID } = req.params;

    try {      
        const collaborators = await Collaborator.find({ "layer._id" : layerID, state: true });

        if( !collaborators ) return res.status(404).json({
            msg: 'This layer has no collaborators yet',
            collaborators: []
        });

        res.status(200).json({
            collaborators
        });

    } catch (error) {
      res.status(500).json({
            msg: 'Internal Server Error'
        });
    };
};


export const addLayerCollaborator = async (req: Request, res: Response) => {

    const { layerID } = req.params;

};


export const response = async(req: Request, res: Response) => {
    const {
        creatingMiddlewareState,
        updatingMiddlewareState,
        deletingMiddlewareState,
        totalCreatedCollaborators,
        totalDeletedCollaborators
    } = req;

    let messageParts = []; // Para acumular partes del mensaje basado en las operaciones realizadas

    // Crear mensajes según el estado de cada operación
    if (deletingMiddlewareState) {
        messageParts.push(`${totalDeletedCollaborators} collaborator(s) deleted.`);
    } 

    if (updatingMiddlewareState) {
        messageParts.push("Collaborators updated successfully.");
    } 

    if (creatingMiddlewareState) {
        messageParts.push(`${totalCreatedCollaborators} new collaborator(s) added.`);
    } 

    // Construir el mensaje final
    const finalMessage = messageParts.join(' ');

    // Enviar la respuesta
    res.json({
        success: true,
        message: finalMessage
    });
};




