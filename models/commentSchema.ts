
import mongoose from 'mongoose';

  
  const commentSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    commentParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null // Esto indica que puede ser un comentario principal o una respuesta
    },
    answering_to : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    likes: {
      type: Number,
      default: 0
    },
    replies : {
      type: Number,
      default: 0
    },
    total_pages: {
      type: Number,
      default: 0
    },
    state: {
      type: Boolean,
      default: true
    }
  }, { timestamps: true} );

  
// Crear y exportar el modelo de comentarios
export default mongoose.model('Comment', commentSchema);
