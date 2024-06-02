import { Schema, model } from "mongoose";

const friendshipSchema = new Schema({
  ids: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
  }, { timestamps: true });
  
const Friendship = model('Friendship', friendshipSchema);
export default Friendship;
