import { Schema, model } from "mongoose";

const followerSchema = new Schema({
    uid: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },    
    followerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    mutualFollow: {
      type: Boolean,
      default: false
    },
    followedAt: {
        type: Date,
        default: Date.now
    }
  }, { timestamps: true });
  
const Follower = model('Follower', followerSchema);
export default Follower;
