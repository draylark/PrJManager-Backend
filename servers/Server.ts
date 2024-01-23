import express, { Application } from 'express'
import cors from 'cors'
import dbConnection from '../db/connection'
import { authRouter, usersRouter, proyectsRouter, tasksRouter,
     notisRouter, clientRouter, eventRouter, reposRouter, gitlabRouter, 
     commentsRouter, searcherRouter, friendsRouter, likesRouter, 
     extensionRouter 
} from '../routes'
import cookieParse  from 'cookie-parser'

interface Paths {
    auth: string,
    users: string,
    proyects: string,
    tasks: string,
    notis: string
    client: string
    event: string
    repos: string
    gitlab: string,
    comments: string,
    searcher: string,
    friends: string,
    likes: string,
    extension: string
}

// https://localhost:3000/api/auth/login

class Server {
    private app: Application
    private port: string
    private paths: Paths

    constructor(){
        this.app = express()
        this.port = process.env.PORT || '3000'
        this.paths = {
            auth: '/api/auth',
            users: '/api/users',
            proyects: '/api/projects',
            tasks: '/api/tasks',
            notis: '/api/notis',
            client: '/api/client',
            event: '/api/event',
            repos: '/api/repos',
            gitlab: '/api/gitlab',
            comments: '/api/comments',
            searcher: '/api/searcher',
            friends: '/api/friends',
            likes: '/api/likes',
            extension: '/api/extension'
        }
        
        this.conectarDB()
        this.middlewares()
        this.routes()
    }


    async conectarDB(){
        await dbConnection()
    }


    middlewares(){
        this.app.use( cors( { 
            origin: 'http://localhost:5173',
            credentials: true 
        } ) )
        this.app.use( express.json() )
        this.app.use( cookieParse() )
        this.app.use( express.static('public'))
    }


    listen(){
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        });
    }

    routes(){
        
        this.app.use( this.paths.auth, authRouter)
        this.app.use( this.paths.users, usersRouter)
        this.app.use( this.paths.proyects, proyectsRouter)
        this.app.use( this.paths.tasks, tasksRouter)
        this.app.use( this.paths.notis, notisRouter)
        this.app.use( this.paths.client, clientRouter)
        this.app.use( this.paths.event, eventRouter)
        this.app.use( this.paths.repos, reposRouter)
        this.app.use( this.paths.gitlab, gitlabRouter)
        this.app.use( this.paths.comments, commentsRouter)
        this.app.use( this.paths.searcher, searcherRouter)
        this.app.use( this.paths.friends, friendsRouter)
        this.app.use( this.paths.likes, likesRouter)
        this.app.use( this.paths.extension, extensionRouter)
        

    }

}


export default Server