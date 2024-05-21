
import { model, Schema } from 'mongoose'


const UserSchema = new Schema({
    username: {
        type: String,
        require: [true, 'Name is required']
    },
    email: {
        type: String,
        require: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        require: [true, 'Password is required']
    },
    photoUrl: {
        type: String,
        default: null
    },
    google: {
        type: Boolean,
        default: false
    },
    website: {
        type: String,
        default: null
    },
    github: {
        type: String,
        default: null
    },
    twitter: {
        type: String,
        default: null
    },
    linkedin: {
        type: String,
        default: null
    },
    projects: {
        type: Number,
        default: 0
    },
    topProjects: {
        type: [Schema.Types.ObjectId],
        ref: 'Project',
        default: []
    },
    state: {
        type: Boolean,
        default: true
    },
    personalAccessToken: {
        type: String,
        default: null
    }
})

UserSchema.methods.toJSON = function(){
    const { __v, password, _id, ...user } = this.toObject();
    user.uid = _id
    return user
}

export default model( 'User', UserSchema )