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
const mongoose_1 = __importDefault(require("mongoose"));
const dbConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGO_CNN;
        if (!mongoUri) {
            throw new Error('MONGO_CNN environment variable is not defined');
        }
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            retryReads: true // Habilita los reintentos automáticos en operaciones de lectura
        };
        yield mongoose_1.default.connect(mongoUri, options);
        console.log('Base de datos inicializada');
    }
    catch (error) {
        console.warn('There has been an error while initializing the DB.');
        console.error(error);
        setTimeout(dbConnection, 5000); // Intenta reconectar cada 5 segundos en caso de falla inicial
    }
});
exports.default = dbConnection;
//# sourceMappingURL=connection.js.map