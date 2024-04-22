import { Schema, model } from "mongoose";


const TaskSchema = new Schema({

  type: {
    type: String,
    enum: ['open', 'assigned'],
    required: true
  },

  layer_number_task: { 
    type: String, required: true 
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
    required: true,
    enum: ['pending', 'approval', 'completed'],
    default: 'completed'
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  conclusion_date: { type: Date },

  deadline: { 
    type: Date, 
    default: null 
  },

  additional_info: {
    estimated_hours: { type: Number },
    actual_hours: { type: Number },
    notes: [{ type: String }],
  },
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contributorsIds: [{ 
    type: String 
  }],
}, { timestamps: true });


TaskSchema.methods.toJSON = function(){
    const { __v, ...task } = this.toObject();
    return task
}


const Task = model('Task', TaskSchema);

export default Task;