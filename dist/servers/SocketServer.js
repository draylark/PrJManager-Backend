"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server);
    io.on('connection', (socket) => {
        console.log('Un cliente se ha conectadox3333');
        // Aquí puedes definir más manejadores de eventos para este socket
        io.on('message', function (data) {
            socket.broadcast.emit('message', `bitchhhh ${data}`);
        });
        socket.on('disconnect', () => {
            console.log('Un cliente se ha desconectado');
        });
        // Puedes agregar aquí más eventos según sea necesario
    });
    return io;
};
exports.initSocket = initSocket;
const getSocket = () => {
    if (!io) {
        throw new Error("Socket.IO no ha sido inicializado.");
    }
    return io;
};
exports.getSocket = getSocket;
//# sourceMappingURL=SocketServer.js.map