"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAndOrganizeProjectData = exports.handleAndOrganizeData = void 0;
const handleAndOrganizeData = (req, res, next) => {
    const { createdProjects, createdLayers, createdRepos, commits, tasks } = req;
    let allEvents = [];
    try {
        // Añadir proyectos creados
        createdProjects.forEach(project => {
            allEvents.push({
                type: 'project_created',
                date: project.createdAt,
                data: project,
            });
        });
        // Añadir capas creadas
        createdLayers.forEach(layer => {
            allEvents.push({
                type: 'layer_created',
                date: layer.createdAt,
                data: layer,
            });
        });
        // Añadir repositorios creados
        createdRepos.forEach(repo => {
            allEvents.push({
                type: 'repo_created',
                date: repo.createdAt,
                data: repo,
            });
        });
        // Añadir commits
        commits.commits1.forEach(commit => {
            allEvents.push({
                type: 'commit',
                date: commit.createdAt,
                data: commit,
            });
        });
        commits.commits2.forEach(commit => {
            allEvents.push({
                type: 'commit_with_task',
                date: commit.createdAt,
                data: commit,
            });
        });
        // Añadir tareas
        tasks.taskSet0.forEach(task => {
            allEvents.push({
                type: 'task_created',
                date: task.createdAt,
                data: task,
            });
        });
        tasks.tasksSet1.forEach(task => {
            allEvents.push({
                type: 'task_review_submission',
                date: task.reviewSubmissionDate,
                data: task,
            });
        });
        tasks.tasksSet2.forEach(task => {
            allEvents.push({
                type: 'task_completed',
                date: task.completed_at,
                data: task,
            });
        });
        tasks.tasksSet3.forEach(task => {
            allEvents.push({
                type: 'task_contributor_review_submission',
                date: task.reviewSubmissionDate,
                data: task,
            });
        });
        tasks.tasksSet4.forEach(task => {
            allEvents.push({
                type: 'task_contributor_completed',
                date: task.completed_at,
                data: task,
            });
        });
        tasks.tasksSet5.forEach(task => {
            allEvents.push({
                type: 'task_contributor_marked_ready',
                date: task.readyContributorData.date,
                data: task,
            });
        });
        // Ordenar eventos por fecha en orden descendente (más recientes primero)
        allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        req.allEvents = allEvents;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};
exports.handleAndOrganizeData = handleAndOrganizeData;
const handleAndOrganizeProjectData = (req, res, next) => {
    const { createdLayers, createdRepos, commits, tasks } = req;
    // Combinar todos los datos en un solo array
    let allEvents = [];
    try {
        // Añadir capas creadas
        createdLayers.forEach(layer => {
            allEvents.push({
                type: 'layer_created',
                date: layer.createdAt,
                data: layer,
            });
        });
        // Añadir repositorios creados
        createdRepos.forEach(repo => {
            allEvents.push({
                type: 'repo_created',
                date: repo.createdAt,
                data: repo,
            });
        });
        // Añadir commits
        commits.commits1.forEach(commit => {
            allEvents.push({
                type: 'commit',
                date: commit.createdAt,
                data: commit,
            });
        });
        commits.commits2.forEach(commit => {
            allEvents.push({
                type: 'commit_with_task',
                date: commit.createdAt,
                data: commit,
            });
        });
        // Añadir tareas
        tasks.taskSet0.forEach(task => {
            allEvents.push({
                type: 'task_created',
                date: task.createdAt,
                data: task,
            });
        });
        tasks.tasksSet1.forEach(task => {
            allEvents.push({
                type: 'task_review_submission',
                date: task.reviewSubmissionDate,
                data: task,
            });
        });
        tasks.tasksSet2.forEach(task => {
            allEvents.push({
                type: 'task_completed',
                date: task.completed_at,
                data: task,
            });
        });
        tasks.tasksSet3.forEach(task => {
            allEvents.push({
                type: 'task_contributor_review_submission',
                date: task.reviewSubmissionDate,
                data: task,
            });
        });
        tasks.tasksSet4.forEach(task => {
            allEvents.push({
                type: 'task_contributor_completed',
                date: task.completed_at,
                data: task,
            });
        });
        tasks.tasksSet5.forEach(task => {
            allEvents.push({
                type: 'task_contributor_marked_ready',
                date: task.completed_at,
                data: task,
            });
        });
        // Ordenar eventos por fecha en orden descendente (más recientes primero)
        allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        // console.log('events', allEvents)
        req.allEvents = allEvents;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};
exports.handleAndOrganizeProjectData = handleAndOrganizeProjectData;
//# sourceMappingURL=helpers-middlewares.js.map