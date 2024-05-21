import { Schema, model } from "mongoose";

const NoteSchema = new Schema({
  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  text: {
    type: String,
    default: null,
    maxlength: 500  // Por ejemplo, un máximo de 500 caracteres
  },
}, { timestamps: true });

const Note = model('Note', NoteSchema);
export default Note;
