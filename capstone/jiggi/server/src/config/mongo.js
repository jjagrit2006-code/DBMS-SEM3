const mongoose = require('mongoose');

let isMongoConnected = false;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vortex_lounge';

async function initMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to ${MONGODB_URI}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB] MongoDB daemon not reachable on ${MONGODB_URI} (${err.message}). Using integrated in-memory telemetry simulation layer.`);
  }
}

// In-Memory Telemetry Fallback
const memoryTelemetry = {
  rig_telemetry: [
    {
      station_code: 'VIP-01',
      gpu_name: 'NVIDIA RTX 4090 OC',
      gpu_temp_celsius: 58.4,
      gpu_usage_pct: 84,
      cpu_temp_celsius: 62.1,
      cpu_usage_pct: 42,
      ram_used_gb: 18.6,
      current_fps: 342,
      frame_time_ms: 2.92,
      network_ping_ms: 4,
      logged_at: new Date()
    },
    {
      station_code: 'PC-01',
      gpu_name: 'NVIDIA RTX 4080 Super',
      gpu_temp_celsius: 54.2,
      gpu_usage_pct: 76,
      cpu_temp_celsius: 59.8,
      cpu_usage_pct: 38,
      ram_used_gb: 14.2,
      current_fps: 238,
      frame_time_ms: 4.20,
      network_ping_ms: 6,
      logged_at: new Date()
    },
    {
      station_code: 'SIM-01',
      wheelbase_torque_nm: 14.8,
      wheelbase_temp_celsius: 46.2,
      pedal_pressure_pct: 68,
      motion_pitch_degrees: 3.2,
      gpu_temp_celsius: 61.0,
      current_fps: 165,
      network_ping_ms: 5,
      logged_at: new Date()
    }
  ],
  match_events: [
    {
      match_id: 'MATCH-2026-VAL-01',
      game: 'Valorant',
      tournament: 'Vortex Mumbai Open Invitational',
      map: 'Ascent',
      team_a: 'Team Phoenix',
      team_b: 'Velocity Esports',
      current_round: 14,
      score: '8 - 6',
      events: [
        { round: 12, event: 'Aarav Sharma clutched 1v2 defuse', timestamp: '22:15:30' },
        { round: 13, event: 'Velocity Esports executed A site plant', timestamp: '22:18:10' },
        { round: 14, event: 'First blood by Aarav on Mid Market', timestamp: '22:20:45' }
      ]
    }
  ]
};

module.exports = {
  initMongoDB,
  isMongoLive: () => isMongoConnected,
  memoryTelemetry,
  MONGODB_URI
};
