import { model, mongo, Schema } from 'mongoose';
const mongoModel = model(
  'songdata',
  new Schema({
    album: {
      album_type: { type: String, default: '' },
      artists: { type: Array, default: [] },
      available_markets: { type: Array, default: [] },
      external_urls: { type: Object, default: {} },
      href: { type: String, default: '' },
      id: { type: String, default: '' },
      images: { type: Array, default: [] },
      name: { type: String, default: '' },
      release_date: { type: String, default: '' },
      release_date_precision: { type: String, default: '' },
      total_tracks: { type: Number, default: 0 },
      type: { type: String, default: '' },
      uri: { type: String, default: '' }
    },
    artists: { type: Array, default: [] },
    available_markets: { type: Array, default: [] },
    disc_number: { type: Number, default: 0 },
    duration_ms: { type: Number, default: 0 },
    explicit: { type: Boolean, default: false },
    external_ids: { type: Object, default: {} },
    external_urls: { type: Object, default: {} },
    href: { type: String, default: '' },
    id: { type: String, default: '' },
    is_local: { type: Boolean, default: false },
    name: { type: String, default: '' },
    popularity: { type: Number, default: 0 },
    preview_url: { type: String, default: '' },
    track_number: { type: Number, default: 0 },
    type: { type: String, default: '' },
    uri: { type: String, default: '' }
  })
);
export default mongoModel;
