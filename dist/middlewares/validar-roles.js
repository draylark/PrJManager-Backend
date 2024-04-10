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
exports.showRole = void 0;
const collaboratorSchema_1 = __importDefault(require("../models/collaboratorSchema"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
const showRole = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const authenticatedUser = req.authenticatedUser;
        const projectId = req.params.projectId;
        if (!authenticatedUser) {
            return res.status(500).json({
                msg: 'Se requiere enviar un token válido para autenticar el rol'
            });
        }
        try {
            const project = yield projectSchema_1.default.findById(projectId);
            if (!project) {
                return res.status(404).json({ msg: 'El proyecto no existe' });
            }
            if (project.owner.toString() === authenticatedUser._id.toString()) {
                console.log('Es el owner');
                return next();
            }
            const collaborator = yield collaboratorSchema_1.default.findOne({
                uid: authenticatedUser._id,
                "project._id": projectId
            });
            if (!collaborator || !roles.includes(collaborator.project.accessLevel)) {
                return res.status(401).json({
                    msg: `No posee las credenciales para ejecutar esta acción. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
                });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al procesar la solicitud' });
        }
    });
};
exports.showRole = showRole;
//# sourceMappingURL=validar-roles.js.map