
import { Schema, model, Document } from 'mongoose';

interface IFriend extends Document {
  name: string;
  age: number;
  email: string;
}

const friendSchema = new Schema<IFriend>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const Friend = model<IFriend>('Friend', friendSchema);

export default Friend;
