import { Schema, model } from "mongoose";


const NotisSchema = new Schema({
    type: {
      type: String,
      enum: [ 'friend-request', 'project-invitation', 'task-invitation',
              'new-commit', 'new-task-commit', 'task-approved', 'task-assignation', 'task-rejected', 'added-to-repo', 'added-to-layer' ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: Boolean,
      default: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    from: {
      name: {
        type: String,
        required: true
      },
      ID: {
        type: Schema.Types.ObjectId,
        required: true
      },
      photoUrl: {
        type: String,
        default: null
      }
    },
    additionalData: {
      type: Schema.Types.Mixed,
      default: null
    }
  }, {
    timestamps: true
  });


const Noti = model('Notis', NotisSchema);
export default Noti;