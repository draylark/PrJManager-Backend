import { Schema, model } from 'mongoose';

const sessionSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    prjConsoleUID: {
        type: String,
        required: true,
    },
    extensionUID: {
        type: String,
        required: true
    },
    operativeSystem: {
        type: String,
        default: 'Unknown'
    },
    device: {
        type: String,
        default: 'Unknown'
    }
}, { timestamps: true });

const Session = model('Session', sessionSchema);
export default Session;