
import { Request, Response, NextFunction } from "express"
import { EventBase } from "../../interfaces/interfaces";

export const handleAndOrganizeData = (req: Request, res: Response, next: NextFunction) => {
    const { createdProjects, createdLayers, createdRepos, commitsData, tasksData } = req;

    let allEvents: EventBase[] = [];

    try {
        // Añadir proyectos creados
        if (createdProjects) {
            createdProjects.forEach(project => {
                allEvents.push({
                    type: 'project_created',
                    date: project.createdAt,
                    data: project,
                });
            });
        }

        // Añadir capas creadas
        if (createdLayers) {
            createdLayers.forEach(layer => {
                allEvents.push({
                    type: 'layer_created',
                    date: layer.createdAt,
                    data: layer,
                });
            });
        }

        // Añadir repositorios creados
        if (createdRepos) {
            createdRepos.forEach(repo => {
                allEvents.push({
                    type: 'repo_created',
                    date: repo.createdAt,
                    data: repo,
                });
            });
        }

        // Añadir commits
        if (commitsData?.commits1) {
            commitsData.commits1.forEach(commit => {
                allEvents.push({
                    type: 'commit',
                    date: commit.createdAt,
                    data: commit,
                });
            });
        }

        if (commitsData?.commits2) {
            commitsData.commits2.forEach(commit => {
                allEvents.push({
                    type: 'commit_with_task',
                    date: commit.createdAt,
                    data: commit,
                });
            });
        }

        // Añadir tareas
        if (tasksData?.taskSet0) {
            tasksData.taskSet0.forEach(task => {
                allEvents.push({
                    type: 'task_created',
                    date: task.createdAt,
                    data: task,
                });
            });
        }

        if (tasksData?.tasksSet1) {
            tasksData.tasksSet1.forEach(task => {
                allEvents.push({
                    type: 'task_review_submission',
                    date: task.reviewSubmissionDate,
                    data: task,
                });
            });
        }

        if (tasksData?.tasksSet2) {
            tasksData.tasksSet2.forEach(task => {
                allEvents.push({
                    type: 'task_completed',
                    date: task.completed_at,
                    data: task,
                });
            });
        }

        if (tasksData?.tasksSet3) {
            tasksData.tasksSet3.forEach(task => {
                allEvents.push({
                    type: 'task_contributor_review_submission',
                    date: task.reviewSubmissionDate,
                    data: task,
                });
            });
        }

        if (tasksData?.tasksSet4) {
            tasksData.tasksSet4.forEach(task => {
                allEvents.push({
                    type: 'task_contributor_completed',
                    date: task.completed_at,
                    data: task,
                });
            });
        }

        if (tasksData?.tasksSet5) {
            tasksData.tasksSet5.forEach(task => {
                if (task.readyContributorData && 'date' in task.readyContributorData) {
                    allEvents.push({
                        type: 'task_contributor_marked_ready',
                        date: task.readyContributorData.date,  // Asumiendo que date también es definido si readyContributorData existe
                        data: task,
                    });
                }
            });
        }

        // Ordenar eventos por fecha en orden descendente (más recientes primero)

        allEvents.sort((a, b) => {
            const dateA = new Date(a.date as Date); // Ahora sabemos que date no es null ni undefined
            const dateB = new Date(b.date as Date);
            return dateB.getTime() - dateA.getTime();
        });

        req.allEvents = allEvents;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};


export const handleAndOrganizeProjectData = (req: Request, res: Response, next: NextFunction) => {
    const { createdLayers, createdRepos, commitsData, tasksData } = req;

    // Combinar todos los datos en un solo array
    let allEvents: EventBase[] = [];
  
    try {
        // Añadir capas creadas
        if(createdLayers){
            createdLayers.forEach(layer => {
                allEvents.push({
                type: 'layer_created',
                date: layer.createdAt,
                data: layer,
                });
            });
        }


        // Añadir repositorios creados
        if(createdRepos){
            createdRepos.forEach(repo => {
                allEvents.push({
                type: 'repo_created',
                date: repo.createdAt,
                data: repo,
                });
            });
        }

        // Añadir commits
        if(commitsData && commitsData.commits1){
            commitsData.commits1.forEach(commit => {
                allEvents.push({
                type: 'commit',
                date: commit.createdAt,
                data: commit,
                });
            });
        }
    
        if(commitsData && commitsData.commits2){
            commitsData.commits2.forEach(commit => {
                allEvents.push({
                type: 'commit_with_task',
                date: commit.createdAt,
                data: commit,
                });
            });
        }

        // Añadir tareas
        tasksData.taskSet0.forEach(task => {
            allEvents.push({
            type: 'task_created',
            date: task.createdAt,
            data: task,
            });
        });

        tasksData.tasksSet1.forEach(task => {
            allEvents.push({
            type: 'task_review_submission',
            date: task.reviewSubmissionDate,
            data: task,
            });
        });

        tasksData.tasksSet2.forEach(task => {
            allEvents.push({
            type: 'task_completed',
            date: task.completed_at,
            data: task,
            });
        });

        tasksData.tasksSet3.forEach(task => {
            allEvents.push({
            type: 'task_contributor_review_submission',
            date: task.reviewSubmissionDate,
            data: task,
            });
        });

        tasksData.tasksSet4.forEach(task => {
            allEvents.push({
            type: 'task_contributor_completed',
            date: task.completed_at,
            data: task,
            });
        });


        tasksData.tasksSet5.forEach(task => {
            allEvents.push({
            type: 'task_contributor_marked_ready',
            date: task.completed_at,
            data: task,
            });
        });

        
        // Ordenar eventos por fecha en orden descendente (más recientes primero)
        allEvents.sort((a, b) => {
            const dateA = new Date(a.date as Date); // Ahora sabemos que date no es null ni undefined
            const dateB = new Date(b.date as Date);
            return dateB.getTime() - dateA.getTime();
        }); 

        // console.log('events', allEvents)
        req.allEvents = allEvents;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};


export const validateVisibility = (pVisisibility, lVisibility, rVisibility) => {
    if( pVisisibility === 'public' && lVisibility === 'open' && rVisibility === 'open' ) {
        return true;
    }
    return false;
}