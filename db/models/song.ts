import { model, mongo, Schema } from 'mongoose';
const mongoModel = model(
  'song',
  new Schema({
    data: { type: Object, required: true },
    lyrics: {
      lyricType: { type: String, default: '' },
      lyrics: { type: Array, default: [] }
    }
  })
);
export default mongoModel;
