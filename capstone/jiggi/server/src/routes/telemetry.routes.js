const express = require('express');
const router = express.Router();
const { isMongoLive, memoryTelemetry, MONGODB_URI } = require('../config/mongo');
const RigTelemetry = require('../models/RigTelemetry');
const MatchEvent = require('../models/MatchEvent');
const AuditLog = require('../models/AuditLog');

// Status of MongoDB telemetry service
router.get('/status', async (req, res) => {
  const isConnected = isMongoLive();
  let counts = { telemetry: 0, matches: 0, audit: 0 };

  if (isConnected) {
    try {
      counts.telemetry = await RigTelemetry.countDocuments();
      counts.matches = await MatchEvent.countDocuments();
      counts.audit = await AuditLog.countDocuments();
    } catch (e) {
      // ignore
    }
  }

  res.json({
    status: isConnected ? 'CONNECTED' : 'STANDBY_SIMULATION',
    database: 'MongoDB',
    uri: MONGODB_URI,
    collections: ['rig_telemetry', 'match_events', 'audit_logs'],
    counts: isConnected ? counts : {
      telemetry: memoryTelemetry.rig_telemetry.length,
      matches: memoryTelemetry.match_events.length
    }
  });
});

// Get station hardware telemetry (thermals, fps, ping)
router.get('/station/:station_code', async (req, res, next) => {
  try {
    const code = req.params.station_code.toUpperCase();

    if (isMongoLive()) {
      const docs = await RigTelemetry.find({ station_code: code }).sort({ logged_at: -1 }).limit(10);
      return res.json({ station_code: code, telemetry: docs });
    } else {
      const found = memoryTelemetry.rig_telemetry.filter(t => t.station_code === code);
      return res.json({ station_code: code, telemetry: found.length > 0 ? found : [memoryTelemetry.rig_telemetry[0]] });
    }
  } catch (err) {
    next(err);
  }
});

// Log station hardware telemetry
router.post('/station/:station_code', async (req, res, next) => {
  try {
    const code = req.params.station_code.toUpperCase();
    const data = {
      ...req.body,
      station_code: code,
      logged_at: new Date()
    };

    if (isMongoLive()) {
      const doc = await RigTelemetry.create(data);
      return res.status(201).json({ success: true, doc_id: doc._id });
    } else {
      memoryTelemetry.rig_telemetry.unshift(data);
      return res.status(201).json({ success: true, record: data });
    }
  } catch (err) {
    next(err);
  }
});

// Get tournament match events
router.get('/matches', async (req, res, next) => {
  try {
    if (isMongoLive()) {
      const matches = await MatchEvent.find().sort({ updatedAt: -1 }).limit(10);
      return res.json({ matches });
    } else {
      return res.json({ matches: memoryTelemetry.match_events });
    }
  } catch (err) {
    next(err);
  }
});

// Log match event
router.post('/matches', async (req, res, next) => {
  try {
    if (isMongoLive()) {
      const match = await MatchEvent.create(req.body);
      return res.status(201).json({ success: true, match_id: match._id });
    } else {
      memoryTelemetry.match_events.unshift(req.body);
      return res.status(201).json({ success: true, match: req.body });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
