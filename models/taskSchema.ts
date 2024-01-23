import { Schema, model } from "mongoose";


const TaskSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    }, 
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do'
    },
    dueDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true
  });


TaskSchema.methods.toJSON = function(){
    const { __v, _id, ...task } = this.toObject();
    task.tid = _id
    return task
}


const Task = model('Task', TaskSchema);

export default Task;