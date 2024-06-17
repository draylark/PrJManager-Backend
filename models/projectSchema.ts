
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
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
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
    readme: {
      type: Schema.Types.ObjectId,
      ref: 'Readme',
      default: null
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