import { Request, Response, NextFunction } from 'express';
import Commit from '../models/commitSchema';
import Collaborator from '../models/collaboratorSchema';



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
    const { levels, owner, type } = req
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número
    const uid = req.query.uid;
    
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

        if( type === 'collaborator' ) {

            const commits = await Commit.find(matchConditions)
                                    .populate('layer repository associated_task')
                                    .lean()

            const filteredCommitsBaseOnLevel = ( await Promise.all( commits.map( async commit => {
                const { layer, repository } = commit;
                const cLayer = await Collaborator.findOne({ uid, projectID, state: true, 'layer._id': layer._id });
                const cRepo = await Collaborator.findOne({ uid, projectID, state: true, 'repository._id': repository._id });

                if( cLayer && cRepo ) {               
                    const commitWithIdsOnly = {
                        ...commit, // Convierte el documento de Mongoose a un objeto JS plano.
                        layer: layer._id, // Usa el _id del documento poblado.
                        repository: repository._id, // Ídem.
                    };
                    return commitWithIdsOnly;          
                }

            }))).filter( commit => commit !== undefined );

            
            const uniqueCommitsOnOpenParents = ( await Promise.all( commits.filter( openCommit => 
                !filteredCommitsBaseOnLevel.some(commit => commit._id.toString() === openCommit._id.toString())
              ).map( async commit => {  
                    const { layer: { _id: layerId, visibility: layerVis }, repository: { _id: repoId, visibility: repoVis }, ...rest } = commit;

                    const cLayer = await Collaborator.findOne({ uid, projectID, 'layer._id': layerId });
                    const cRepo = await Collaborator.findOne({ uid, projectID, 'repository._id': repoId });

                    if(evalAccess(cLayer, cRepo, layerVis, repoVis)) {
                        return { 
                            ...rest,
                            layer: layerId, 
                            repository: repoId,
                         };
                    };
              })
             )).filter(commit => commit !== undefined);

             console.log('filteredCommitsBaseOnLevel', filteredCommitsBaseOnLevel)

            req.commits = [ ...filteredCommitsBaseOnLevel, ...uniqueCommitsOnOpenParents ];
            return next();

        } else {                  
            const commits = await Commit.find(matchConditions)
                                    .populate('layer repository associated_task')
                                    .lean()

            const filteredCommitsBaseOnLevel = commits.reduce((acc, commit) => {
                const { layer, repository } = commit;

                // Verifica que ambos documentos estén poblados y tienen propiedad 'visibility'.
                if (layer && repository && levels.includes(layer.visibility) && levels.includes(repository.visibility)) {
                    // Crea una nueva representación de la tarea que solo incluye los ObjectIds de los documentos relacionados.
                    const commitWithIdsOnly = {
                        ...commit, // Convierte el documento de Mongoose a un objeto JS plano.
                        layer: layer._id, // Usa el _id del documento poblado.
                        repository: repository._id, // Ídem.
                    };
                    acc.push(commitWithIdsOnly);
                };
                return acc;
            }, []);

            req.commits = filteredCommitsBaseOnLevel;
            return next();
        };
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Internal Server error',
            error
        })
    }
};

const evalAccess = ( cOnLayer, cOnRepo, lVisibility, RVisibility ) => {

    if( cOnLayer && cOnRepo && cOnLayer.state && !cOnRepo.state && RVisibility === 'open' ) {
        return true;
    }

    if( cOnLayer && cOnRepo && !cOnLayer.state && lVisibility === 'open' && !cOnRepo.state && RVisibility === 'open' ) {
        return true;
    }

    return false;
};