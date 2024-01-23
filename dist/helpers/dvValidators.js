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
exports.isPrIdExist = exports.isEmailAlreadyExist = exports.isIdExist = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const projectSchema_1 = __importDefault(require("../models/projectSchema"));
// const isRoleValid = async( rol = '' ) => {
//     const roleExist = await Role.findOne({ rol })
//     if ( !roleExist ){
//         throw new Error(`El rol '${rol}' no esta registrado en la DB`)
//     }    
// }
const isEmailAlreadyExist = (email = '') => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield userSchema_1.default.findOne({ email });
    if (exist) {
        throw new Error(`El email ya esta registrado`);
    }
});
exports.isEmailAlreadyExist = isEmailAlreadyExist;
const isIdExist = (id = '') => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield userSchema_1.default.findById(id);
    if (!exist) {
        throw new Error(`El ID '${id}' no existe en la DB`);
    }
});
exports.isIdExist = isIdExist;
const isPrIdExist = (id = '') => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield projectSchema_1.default.findById(id);
    if (!exist) {
        throw new Error(`El ID '${id}' no existe en la DB`);
    }
});
exports.isPrIdExist = isPrIdExist;
//# sourceMappingURL=dvValidators.js.map