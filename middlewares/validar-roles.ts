import { Request, Response, NextFunction } from "express"
import Collaborator from "../models/collaboratorSchema"
import Project from "../models/projectSchema"

const showRole = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authenticatedUser = req.authenticatedUser;
        const projectId = req.params.projectId;

        if (!authenticatedUser) {
            return res.status(500).json({
                msg: 'Se requiere enviar un token válido para autenticar el rol'
            });
        }

        try {
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ msg: 'El proyecto no existe' });
            }

            if (project.owner.toString() === authenticatedUser._id.toString()) {
                console.log('Es el owner');
                return next();
            }
          
            const collaborator = await Collaborator.findOne({
                uid: authenticatedUser._id,
                "project._id": projectId
            });

            if (!collaborator || !roles.includes(collaborator.project.accessLevel)) {
                return res.status(401).json({
                    msg: `No posee las credenciales para ejecutar esta acción. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al procesar la solicitud' });
        }
    }
}

export {
    showRole
}