import { Schema, model } from "mongoose";

const likeSchema = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    isLike: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

export default model('Like', likeSchema);