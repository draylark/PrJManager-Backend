import { Schema, model } from 'mongoose';


const collaboratorSchema = new Schema({
    repository: {
        type: Schema.Types.ObjectId,
        ref: 'Repo', // Asegúrate de que este nombre coincida con el modelo de tu repositorio
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Asegúrate de que este nombre coincida con el modelo de tu usuario
        required: true
    },
    accessLevel: {
        type: String,
        enum: ['Editor', 'Reader', 'Admin', 'Owner'],
        required: true
    }
});

export default model('Collaborator', collaboratorSchema);

