import { Schema, model } from "mongoose";

const friendshipSchema = new Schema({
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'following'],
      default: 'following'
    }
  }, { timestamps: true });
  
const Friendship = model('Friendship', friendshipSchema);
export default Friendship;
