import { Schema, model } from 'mongoose';

const repoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  gitlabId: {
    type: Number,
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  layer: {
    type: Schema.Types.ObjectId,
    ref: 'Layer',
    required: true,
  },
  visibility: {
    type: String,
    required: true,
    enum: ['public', 'internal', 'private'],
  },
  webUrl: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      accessLevel: {
        type: String,
        enum: ['Editor', 'Reader', 'Admin', 'owner'],
        required: true,
      },
    },
  ],
  branches: [
    {
      name: {
        type: String,
        required: true,
      },
      lastCommit: {
        type: Schema.Types.ObjectId,
        ref: 'Commit',
      },
    },
  ],
  commits: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Commit',
    },
  ],
  gitUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Repo = model('Repo', repoSchema);

export default Repo;