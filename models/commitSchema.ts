import mongoose, { Schema, model, Document } from 'mongoose';

// Definir el esquema del commit del repositorio
const CommitSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    layer: {
        type: Schema.Types.ObjectId,
        ref: 'Layer',
        required: true
    },
    repository: { 
        type: Schema.Types.ObjectId,
        ref: 'Repo', 
        required: true 
    },
    branch: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    author: { 
        uid: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        name: { 
            type: String, 
            required: true 
        },
        photoUrl: { 
            type: String, 
            default: null
        }
    },
    message: { 
        type: String, 
        required: true 
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    uuid: {
        type: String,
        required: true
    },
    associated_task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    }
}, { timestamps: true });


const Commit = model( 'Commit', CommitSchema )

export default Commit;