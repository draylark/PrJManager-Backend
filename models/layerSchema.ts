import { Schema, model } from 'mongoose';

const LayerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'internal'],
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    repositories: [{
        type: Schema.Types.ObjectId,
        ref: 'Repo'
    }],
    collaborators: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        accessLevel: {
            type: Number,
            required: true
        }
    }],
    gitlabId: {
        type: Number,
        required: true
    }
});

export default model('Layer', LayerSchema);
