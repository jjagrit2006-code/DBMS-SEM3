const mongoose = require('mongoose');

const RigTelemetrySchema = new mongoose.Schema({
  station_code: { type: String, required: true, index: true },
  session_id: { type: Number, index: true },
  user_id: { type: Number, index: true },
  gpu_name: { type: String, default: 'NVIDIA RTX' },
  gpu_temp_celsius: { type: Number, required: true },
  gpu_usage_pct: { type: Number, required: true },
  cpu_temp_celsius: { type: Number, required: true },
  cpu_usage_pct: { type: Number, required: true },
  ram_used_gb: { type: Number, default: 0 },
  current_fps: { type: Number, required: true },
  frame_time_ms: { type: Number },
  network_ping_ms: { type: Number, default: 5 },
  packet_loss_pct: { type: Number, default: 0.0 },
  raw_diagnostics: { type: mongoose.Schema.Types.Mixed },
  logged_at: { type: Date, default: Date.now, index: { expires: '30d' } }
}, {
  timestamps: true,
  collection: 'rig_telemetry'
});

// Compound index for querying recent station thermals
RigTelemetrySchema.index({ station_code: 1, logged_at: -1 });

module.exports = mongoose.model('RigTelemetry', RigTelemetrySchema);
