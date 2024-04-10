
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
    lastUpdated: {
      type: Date,
      default: Date.now
    },


    status: {
      type: String,
      enum: [ 'In Progress', 'Completed', 'On Hold', 'Cancelled' ],
      default: 'In Progress'
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },

    tags: [String],


    collaborators: {
      type: Number,
      default: 0
    },
    layers: {
      type: Number,
      default: 0
    },
    repositories: {
      type: Number,
      default: 0   
    },
    commits: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    tasks: {
      type: Number,
      default: 0
    },

    
    advancedSettings: {

    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

  }, { timestamps: true });



ProjectSchema.methods.toJSON = function(){
    const { __v, password, _id, ...project } = this.toObject();
    project.pid = _id
    return project
}


const Project = model('Project', ProjectSchema)
export default Project;