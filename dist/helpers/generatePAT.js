"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePAT = void 0;
const crypto_1 = require("crypto");
const generatePAT = () => {
    const token = (0, crypto_1.randomBytes)(32).toString('hex');
    return token;
};
exports.generatePAT = generatePAT;
//# sourceMappingURL=generatePAT.js.map