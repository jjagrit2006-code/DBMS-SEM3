const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  actor_id: { type: Number, index: true },
  actor_role: { type: String },
  target_resource: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed },
  ip_address: { type: String },
  status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
  timestamp: { type: Date, default: Date.now, index: { expires: '90d' } }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
