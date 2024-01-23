
import mongoose, { Schema, Document } from 'mongoose';

// Definir la interfaz para el documento de comentario
// interface IComment extends Document {
//     projectId: string;
//     content: string;
//     author: string;
//     createdAt: Date;
// }

// // Definir el esquema de comentarios
// const commentSchema = new Schema({
//     project: { type: Schema.Types.ObjectId, ref: 'Project' },
//     user: { type: Schema.Types.ObjectId, ref: 'User' },
//     text: String,
//     createdAt: { type: Date, default: Date.now }
//   });



const replySchema = new mongoose.Schema({
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const commentSchema = new mongoose.Schema({
    content: String,
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null // Esto indica que puede ser un comentario principal o una respuesta
    },
    likes: Number
  });
  

// Crear y exportar el modelo de comentarios
export default mongoose.model('Comment', commentSchema);
