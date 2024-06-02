import { Request, Response, NextFunction } from 'express';
import Commit from '../models/commitSchema';
import Collaborator from '../models/collaboratorSchema';

const evalAccess = ( cOnLayer, cOnRepo, lVisibility, RVisibility ) => {

    if( cOnLayer && cOnRepo && cOnLayer.state && !cOnRepo.state && RVisibility === 'open' ) {
        return true;
    }

    if( cOnLayer && cOnRepo && !cOnLayer.state && lVisibility === 'open' && !cOnRepo.state && RVisibility === 'open' ) {
        return true;
    }

    return false;
};


export const getContributorsCommits = async (req, res, next) => {
    const { taskId } = req.params;
    const { hashes, contributorsData } = req;

    try {
        const commits = await Commit.find({ uuid: { $in: hashes }})
        .select('uuid createdAt author associated_task')
        .sort({ createdAt: -1 })
        .lean();

        const initializedContributors = contributorsData.reduce((acc, contributor) => {
            acc[contributor._id] = {
                id: contributor._id,
                username: contributor.username,
                photoUrl: contributor.photoUrl || null,
                commits: 0,
                lastCommit: null,
                firstCommit: null
            };
            return acc;
        }, {});

        commits.forEach(commit => {
            const contributor = initializedContributors[commit.author.uid];
            if (contributor) {
                contributor.commits += 1;
                if (!contributor.firstCommit || new Date(commit.createdAt) < new Date(contributor.firstCommit.createdAt)) {
                    contributor.firstCommit = commit;
                }
                if (!contributor.lastCommit || new Date(commit.createdAt) > new Date(contributor.lastCommit.createdAt)) {
                    contributor.lastCommit = commit;
                }
            }
        });

        req.data = initializedContributors;
        next();
    } catch (error) {
        console.error('Error getting contributors commits:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const getCommitsHashes = async(req: Request, res: Response, next: NextFunction) => {
    const { uuid1, uuid2 } = req.query

    console.log('uuid1',uuid1)
    console.log('uuid2',uuid2)

    try {   
        if( uuid2 === '' && uuid1 !== ''){
            console.log('uuid2 es un string vacio')
            const commit1 = await Commit.findOne({ uuid: uuid1 })
                                .select('hash repository')
                                .populate('repository')

            req.hash1 = commit1?.hash
            req.hash2 = null
            req.gitlabId = commit1.repository.gitlabId
            next()

        } else if( uuid1 === '' && uuid2 !== '' ){
            console.log('uuid1 es un string vacio')
            const commit1 = await Commit.findOne({ uuid: uuid2 })
                                .select('hash repository')
                                .populate('repository')

            req.hash1 = commit1?.hash
            req.hash2 = null
            req.gitlabId = commit1.repository.gitlabId
            next()

        } else {
            const commit1 = await Commit.findOne({ uuid: uuid1 })
                                .select('hash repository')
                                .populate('repository')
            const commit2 = await Commit.findOne({ uuid: uuid2 })
                                    .select('hash')

            if (!commit1 || !commit2) {
                return res.status(404).json({ message: 'Commit not found' });
            }

            req.hash1 = commit1.hash
            req.hash2 = commit2.hash
            req.gitlabId = commit1.repository.gitlabId

            next();
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error'
        })    
    }
}


export const getCommits = async(req: Request, res: Response, next: NextFunction) => {
    const { task } = req;

    if(!task.commits_hashes || task.commits_hashes.length === 0) {
        req.commits = [];
        return next();
    }

    try {
        const commits = await Commit.find({ uuid: { $in: task.commits_hashes } })
                                    .select('uuid createdAt author')
                                    .sort({ createdAt: -1 })
                                    .lean();
        req.commits = commits;

        next();
    } catch (error) {
        console.error('Error getting commits:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

};




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

};

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
                                    .select('-hash')
                                    .sort({ createdAt: -1 })
                                    .lean()


            // ! Commits en el que el usuario tiene acceso como colaborador ( state : true )

            const filteredCommitsBaseOnLevel = ( await Promise.all( commits.map( async commit => {
                const { layer, repository } = commit;
                const cLayer = await Collaborator.findOne({ uid, projectID, state: true, 'layer._id': layer._id });
                const cRepo = await Collaborator.findOne({ uid, projectID, state: true, 'repository._id': repository._id });

                if( cLayer && cRepo ) {               
                    const commitWithIdsOnly = {
                        ...commit, 
                        layer: layer._id, 
                        repository: repository._id, 
                    };
                    return commitWithIdsOnly;          
                }
            }))).filter( commit => commit !== undefined );

            
            // ! Commits en el caso de que el usuario no tiene acceso como colaborador ( state: false ), pero los padres son abiertos

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

            req.commits = [ ...filteredCommitsBaseOnLevel, ...uniqueCommitsOnOpenParents ];
            return next();

        } else {                  
            const commits = await Commit.find(matchConditions)
                                    .populate('layer repository associated_task')
                                    .select('-hash')
                                    .sort({ createdAt: -1 })
                                    .lean()

            // ! Commits en el caso de que el usuario sea un guest
            const filteredCommitsBaseOnLevel = commits.reduce((acc, commit) => {
                const { layer, repository } = commit;          
                if (layer && repository && levels.includes(layer.visibility) && levels.includes(repository.visibility)) {
                   
                    const commitWithIdsOnly = {
                        ...commit, 
                        layer: layer._id, 
                        repository: repository._id, 
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

export const getCommitsLength = async(req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.params;
    const { currentYear, currentMonth  } = req.query;

    // Convertir a números si no lo son, ya que los parámetros de la consulta son recibidos como strings
    const year = Number(currentYear);
    const month = Number(currentMonth);

    if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({
            message: "Invalid year or month"
        });
    }

    // Ajuste para el índice de mes correcto (-1 si los meses vienen de 1 a 12)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
        return res.status(400).json({
            message: "Generated dates are invalid."
        });
    }
    
    const filter = {
        'author.uid': uid,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    try {
        const commits = await Commit.find(filter);
        req.commitsLength = commits.length;
        return next();
       
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Internal Server error',
            error
        })   
    }


};

export const getCommitsDates = async(req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.params;
    const { startDate, endDate } = req.query

    try {
        const commits1 = await Commit.find({ 'author.uid': uid, associated_task: null, createdAt: { $gte: startDate, $lte: endDate } })
                                    .select('createdAt uuid author _id repository branch')
                                    .populate('repository', 'name')
                                    .sort({ createdAt: -1 })
                                    .lean()

        const commits2 = await Commit.find({ 'author.uid': uid, associated_task: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } })
                                    .select('createdAt uuid author _id repository branch associated_task')
                                    .populate('repository', 'name')
                                    .populate('associated_task', 'task_name')
                                    .sort({ createdAt: -1 })
                                    .lean()    

        req.commits = { commits1, commits2 } 
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server error'
        })
    }
};

export const getProjectCommitsDates = async(req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { startDate, endDate, uid } = req.query

    try {
        const commits1 = await Commit.find({ project: projectId, 'author.uid': uid, associated_task: null, createdAt: { $gte: startDate, $lte: endDate } })
                                    .select('createdAt uuid author _id repository branch')
                                    .populate('repository', 'name')
                                    .sort({ createdAt: -1 })
                                    .lean()

        const commits2 = await Commit.find({ project: projectId, 'author.uid': uid, associated_task: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } })
                                    .select('createdAt uuid author _id repository branch associated_task')
                                    .populate('repository', 'name')
                                    .populate('associated_task', 'task_name')
                                    .sort({ createdAt: -1 })
                                    .lean()    

        req.commits = { commits1, commits2 }
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server error'
        })
    }
};


export const getProfileCommitsFiltered = async(req: Request, res: Response, next: NextFunction) => {

    const { uid } = req.params;
    const {  year } = req.query;

    let matchCondition = { 'author.uid': uid } ;
    if (year) {
        matchCondition = { 
        ...matchCondition,
        createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
        }
        };
    }

    try {
        const commits = await Commit.find(matchCondition)
                                    .select('createdAt uuid author _id repository layer project')
                                    .populate('repository', 'visibility name')
                                    .populate('layer', 'visibility name')
                                    .populate('project', 'visibility name')
                                    .populate('associated_task', 'task_name')
                                    .sort({ createdAt: -1 })
                                    .lean()


        const filteredCommits = commits.reduce((acc, commit) => {
            const { layer, repository, project } = commit;
            if (validateVisibility(project.visibility, layer.visibility, repository.visibility)) {
                acc.push(commit);
            }
            return acc;
        }, []);

        req.commits = filteredCommits;
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error'
        });
    };
};



export const validateVisibility = (pVisisibility, lVisibility, rVisibility) => {
    if( pVisisibility === 'public' && lVisibility === 'open' && rVisibility === 'open' ) {
        return true;
    }
    return false;
}