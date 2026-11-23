const mongoose = require('mongoose');

const MatchEventSchema = new mongoose.Schema({
  match_id: { type: String, required: true, index: true },
  game: { type: String, required: true, index: true },
  tournament: { type: String, default: 'Vortex Community Tournament' },
  map: { type: String },
  team_a: { type: String, required: true },
  team_b: { type: String, required: true },
  current_round: { type: Number, default: 1 },
  score: { type: String, default: '0 - 0' },
  events: [{
    round: Number,
    event: String,
    player: String,
    timestamp: String,
    coordinates: { x: Number, y: Number }
  }],
  status: { type: String, enum: ['LIVE', 'COMPLETED', 'PAUSED'], default: 'LIVE' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'match_events'
});

module.exports = mongoose.model('MatchEvent', MatchEventSchema);
