"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const Socket = (server) => {
    server.on('connection', (socket) => {
        console.log('Cliente WebSocket conectado2222');
        // Aquí puedes configurar manejadores de eventos básicos o dejarlo para los controladores
        socket.on('close', () => {
            console.log('Cliente WebSocket desconectado');
        });
    });
};
exports.Socket = Socket;
//# sourceMappingURL=WebSocket.js.map