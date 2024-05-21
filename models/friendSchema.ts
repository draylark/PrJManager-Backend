
import { Schema, model, Document } from 'mongoose';


const friendSchema = new Schema({
  friends_reference: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  friendship_status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  state: {
    type: Boolean,
    default: false,
  }
});


const Friend = model('Friend', friendSchema);

export default Friend;
