"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = __importDefault(require("../db/connection"));
const routes_1 = require("../routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ws_1 = __importDefault(require("ws"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3000';
        this.ws = new ws_1.default.Server({ port: 8081 });
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
        };
        this.configureWebSocket();
        this.conectarDB();
        this.middlewares();
        this.routes();
    }
    configureWebSocket() {
        this.ws.on('connection', (socket) => {
            console.log('Cliente WebSocket conectado');
            // Aquí puedes configurar manejadores de eventos básicos o dejarlo para los controladores
            socket.on('close', () => {
                console.log('Cliente WebSocket desconectado');
            });
        });
    }
    getWebSocketServer() {
        return this.ws;
    }
    conectarDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, connection_1.default)();
        });
    }
    middlewares() {
        this.app.use((0, cors_1.default)({
            origin: 'http://localhost:5173',
            credentials: true
        }));
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(express_1.default.static('public'));
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        });
    }
    routes() {
        this.app.use(this.paths.auth, routes_1.authRouter);
        this.app.use(this.paths.users, routes_1.usersRouter);
        this.app.use(this.paths.proyects, routes_1.proyectsRouter);
        this.app.use(this.paths.tasks, routes_1.tasksRouter);
        this.app.use(this.paths.notis, routes_1.notisRouter);
        this.app.use(this.paths.client, routes_1.clientRouter);
        this.app.use(this.paths.event, routes_1.eventRouter);
        this.app.use(this.paths.repos, routes_1.reposRouter);
        this.app.use(this.paths.gitlab, routes_1.gitlabRouter);
        this.app.use(this.paths.comments, routes_1.commentsRouter);
        this.app.use(this.paths.searcher, routes_1.searcherRouter);
        this.app.use(this.paths.friends, routes_1.friendsRouter);
        this.app.use(this.paths.likes, routes_1.likesRouter);
        this.app.use(this.paths.extension, routes_1.extensionRouter);
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map