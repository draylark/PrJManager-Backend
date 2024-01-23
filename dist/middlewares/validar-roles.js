"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showRole = void 0;
const showRole = (...roles) => {
    return (req, res, next) => {
        const [ADMIN, VENTAS] = roles;
        console.log(ADMIN, VENTAS);
        if (!req.authenticatedUser)
            return res.status(500).json({
                msg: 'Se require enviar un token valido para autenticar el rol'
            });
        if (!roles.includes(req.authenticatedUser.role))
            return res.status(401).json({
                msg: `No posee las credenciales para ejecutar esta accion, se require uno de los siguientes roles: ${roles}`
            });
        next();
    };
};
exports.showRole = showRole;
//# sourceMappingURL=validar-roles.js.map