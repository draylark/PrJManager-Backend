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
        enum: [ 'open', 'internal', 'restricted' ],
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
    gitlabId: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

const Layer = model('Layer', LayerSchema);

export default Layer;