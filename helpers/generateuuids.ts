import { v4 as uuidv4 } from 'uuid';


export const generateShortenedUUID = () => {
    // Genera un UUID v4 y quita los guiones
    const uuid = uuidv4().replace(/-/g, '');
    
    // Selecciona los primeros 16 caracteres
    return uuid.substring(0, 16);
};