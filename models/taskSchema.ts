import { Schema, model } from "mongoose";


const noteSchema = new Schema({
  text: {
    type: String,
    default: null
  },
});


const TaskSchema = new Schema({

  type: {
    type: String,
    enum: ['open', 'assigned'],
    required: true
  },

  repository_number_task: {
    type: String,
    default: null
  },

  task_name: { 
    type: String, required: true 
  },

  task_description: { 
    type: String, required: true 
  },

  project : {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  layer_related_id: { 
    type: Schema.Types.ObjectId,
    ref: 'Layer', 
    required: true
  },

  repository_related_id: { 
    type: Schema.Types.ObjectId,
    ref: 'Repo',
    required: true
  },


  goals: [{ type: String }],

  commits_hashes: [{ 
    type: String 
  }],

  status: { 
    type: String, 
    enum: ['pending', 'approval', 'completed'],
    default: 'pending'
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  conclusion_date: { type: Date },

  additional_info: {
    estimated_hours: { 
      type: Number, 
      default: 0
     },
    actual_hours: { 
      type: Number, 
      default: 0
     },
    notes: [{ 
      type: String,
      default: null 
    }],

  },    
  reasons_for_rejection: [
      {
        uid: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },        
        text: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
  ],
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  contributorsIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  readyContributors: [{
    uid: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    me: {
      type: Boolean,
      default: false
    }
  }],

  reviewSubmissionDate:{
    type: Date, 
    default: null 
  },
  deadline: { 
    type: Date, 
    default: null 
  },

  completed_at: {
    type: Date,
    default: null
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });


TaskSchema.methods.toJSON = function(){
    const { __v, ...task } = this.toObject();
    return task
}


const Task = model('Task', TaskSchema);

export default Task;