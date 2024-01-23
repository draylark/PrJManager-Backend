import { Schema, model } from "mongoose";

const likeSchema = new Schema({
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    uid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    }
}, { timestamps: true });

export default model('Like', likeSchema);