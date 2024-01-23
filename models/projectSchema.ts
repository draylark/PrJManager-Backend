
import { model, Schema } from 'mongoose';



const ProjectSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: [],
      default: 'In Progress'
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    layers: [{
      type: Schema.Types.ObjectId,
      ref: 'Group'
    }],
    repos: [{
      type: Schema.Types.ObjectId,
      ref: 'Repo'
    }],
    tasks: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    progress: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      tasksCompleted: {
        type: Number,
        default: 0
      }
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    tags: [String],
    changeLogs: [{
      message: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [String],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    clients: [{
      type: Schema.Types.ObjectId,
      ref: 'Client'
    }]
  });


ProjectSchema.methods.toJSON = function(){
    const { __v, password, _id, ...project } = this.toObject();
    project.pid = _id
    return project
}


export default model('Project', ProjectSchema)