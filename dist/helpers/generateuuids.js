"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortenedUUID = void 0;
const uuid_1 = require("uuid");
const generateShortenedUUID = () => {
    // Genera un UUID v4 y quita los guiones
    const uuid = (0, uuid_1.v4)().replace(/-/g, '');
    // Selecciona los primeros 16 caracteres
    return uuid.substring(0, 16);
};
exports.generateShortenedUUID = generateShortenedUUID;
//# sourceMappingURL=generateuuids.js.map