import mongoose, { Schema, model, Document } from 'mongoose';

// Definir el esquema del commit del repositorio
const ReadmeSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: true
    },
   content: {
        type: String,
        required: true
   },

}, { timestamps: true });


const Readme = model( 'Readme', ReadmeSchema )

export default Readme;