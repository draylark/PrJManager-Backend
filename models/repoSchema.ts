import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const repoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    required: true,
    enum: ['open', 'internal', 'restricted'],
  },
  gitUrl: {
    type: String,
    required: true,
  },
  webUrl: {
    type: String,
    required: true,
  },
  branches: [
    {
      name: { type: String, required: true, unique: true},
      default: { type: Boolean, required: true, },
    },
  ],
  defaultBranch: {
    type: String,
    required: true,
  },
  projectID: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  layerID: {
    type: Schema.Types.ObjectId,
    ref: 'Layer',
    required: true,
  },
  gitlabId: {
    type: Number,
    required: true,
  },
  commits: {
    type: Number,
    default: 0,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
}, { timestamps: true });



repoSchema.methods.toJSON = function(){
  const { __v, webUrl, gitUrl, repoGitlabId, ...repo } = this.toObject();
  return repo
}


const Repo = model('Repo', repoSchema);
export default Repo;