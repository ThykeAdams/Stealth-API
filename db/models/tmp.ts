import { model, mongo, Schema } from 'mongoose'
const mongoModel = model(
  'songdata',
  new Schema({
    trackId: { type: String, default: '', unique: true },
    name: { type: String, default: '' },
    coverArt: { type: String, default: '' },
    explicit: { type: Boolean, default: false },
    artists: { type: Array, default: [] },
    embeddedPreview: { type: String, default: '' },
    album: {
      name: { type: String, default: '' },
      type: { type: String, default: '' },
      artists: [{ type: Array, default: [''] }],
      url: { type: String, default: '' },
      release: { type: String, default: '' },
      tracksInAlbum: { type: Number, default: 0 },
      images: { type: Array, default: [] },
    },
  })
)
export default mongoModel
