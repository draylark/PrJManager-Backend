import { Request, Response, NextFunction } from 'express';
import Commit from '../models/commitSchema';



export const findCommit = async (req: Request, res: Response, next: NextFunction) => {

    const { hash } = req.params;

    try {
        const commit = await Commit.findOne({ uuid: hash });

        if (!commit) {
            return res.status(404).json({ message: 'Commit not found' });
        }

        req.commit = commit;

        next();
    } catch (error) {
        console.error('Error finding commit:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

export const getProjectCommitsBaseOnAccess = async(req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params;
    const { levels, owner } = req
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    
    if( owner && owner === true ) {
        return next();
    }

    let matchConditions = { project: projectID };
    if( year ){
      matchConditions = {
        ...matchConditions,
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`)
        }
      };
    }

    try {
        const commits = await Commit.find(matchConditions)
                                .populate('layer repository')

        const filteredCommitsBaseOnLevel = commits.reduce((acc, commit) => {
            const { layer, repository } = commit;

            // Verifica que ambos documentos estén poblados y tienen propiedad 'visibility'.
            if (layer && repository && levels.includes(layer.visibility) && levels.includes(repository.visibility)) {
                // Crea una nueva representación de la tarea que solo incluye los ObjectIds de los documentos relacionados.
                const commitWithIdsOnly = {
                    ...commit.toObject(), // Convierte el documento de Mongoose a un objeto JS plano.
                    layer: layer._id, // Usa el _id del documento poblado.
                    repository: repository._id, // Ídem.
                };
                acc.push(commitWithIdsOnly);
            };
            return acc;
        }, []);

        req.commits = filteredCommitsBaseOnLevel;
        next();
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        })
    }
};

