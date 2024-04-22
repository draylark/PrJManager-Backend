import { Schema, model } from 'mongoose';


const collaboratorSchema = new Schema({
    project: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
        },
        accessLevel: {
            type: String,
            enum: ['contributor', 'coordinator', 'manager', 'administrator'],
        }
    },
    layer: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Layer',
        },
        accessLevel: {
            type: String,
            enum: ['contributor', 'coordinator', 'manager', 'administrator'],
        }
    },
    repository: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Repo',
        },
        accessLevel: {
            type: String,
            enum: ['reader', 'editor', 'manager', 'administrator'],
        },
        layer: {
            type: Schema.Types.ObjectId,
            ref: 'Layer'
        }
    },
    projectID: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    uid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: null
    },
    photoUrl: {
        type: String,
        default: null
    },
    state: {
        type: Boolean,
        default: true
    },
});


const Collaborator =  model('Collaborator', collaboratorSchema);

export default Collaborator;