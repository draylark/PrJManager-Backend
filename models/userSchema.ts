
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
    status: {
        type: Boolean,
        require: [true, 'Status is required']
    },
    role: {
        type: String,
        require: [true, 'Role is required'],
        emun: ['ADMIN_ROLE', 'USER_ROLE'],
        default: 'USER_ROLE'
    },
    state: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
    createdProjects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    completedproyects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    
    clients: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }],
    friendsRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }],
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