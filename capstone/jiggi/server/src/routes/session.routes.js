const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState, executeSimulation } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all active sessions for live floor control (Staff / Admin)
router.get('/active', authenticateToken, requireRole(['STAFF', 'ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT 
          s.session_id,
          s.user_id,
          s.station_id,
          s.start_time,
          s.hourly_rate_applied,
          s.status,
          s.payment_status,
          TIMESTAMPDIFF(MINUTE, s.start_time, NOW()) AS elapsed_minutes,
          u.username,
          u.full_name,
          u.phone,
          gs.station_code,
          gs.location_zone,
          sc.name AS category_name,
          mt.name AS tier_name,
          mt.hourly_discount_percent
        FROM gaming_sessions s
        JOIN users u ON s.user_id = u.user_id
        JOIN gaming_stations gs ON s.station_id = gs.station_id
        JOIN station_categories sc ON gs.category_id = sc.category_id
        LEFT JOIN player_profiles pp ON u.user_id = pp.player_id
        LEFT JOIN membership_tiers mt ON pp.tier_id = mt.tier_id
        WHERE s.status = 'ACTIVE'
        ORDER BY s.start_time ASC
      `);
      return res.json({ sessions: rows });
    } else {
      const active = memoryState.gaming_sessions
        .filter(s => s.status === 'ACTIVE')
        .map(s => {
          const user = memoryState.users.find(u => u.user_id === s.user_id) || {};
          const station = memoryState.gaming_stations.find(st => st.station_id === s.station_id) || {};
          const cat = memoryState.station_categories.find(c => c.category_id === station.category_id) || {};
          const profile = memoryState.player_profiles.find(p => p.player_id === s.user_id) || {};
          const tier = memoryState.membership_tiers.find(t => t.tier_id === profile.tier_id) || {};
          const elapsed = Math.round((Date.now() - new Date(s.start_time).getTime()) / 60000);

          return {
            session_id: s.session_id,
            user_id: s.user_id,
            station_id: s.station_id,
            start_time: s.start_time,
            hourly_rate_applied: s.hourly_rate_applied,
            status: s.status,
            payment_status: s.payment_status,
            elapsed_minutes: elapsed,
            username: user.username,
            full_name: user.full_name,
            phone: user.phone,
            station_code: station.station_code,
            station_name: station.station_name,
            featured_game: station.featured_game,
            location_zone: station.location_zone,
            category_name: cat.name,
            tier_name: tier.name,
            hourly_discount_percent: tier.hourly_discount_percent || 0
          };
        });
      return res.json({ sessions: active });
    }
  } catch (err) {
    next(err);
  }
});

// Player's ongoing session and past sessions
router.get('/my', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT 
          s.session_id,
          s.station_id,
          s.start_time,
          s.end_time,
          s.duration_minutes,
          s.hourly_rate_applied,
          s.subtotal_amount,
          s.discount_amount,
          s.total_amount,
          s.status,
          s.payment_status,
          TIMESTAMPDIFF(MINUTE, s.start_time, NOW()) AS live_minutes,
          gs.station_code,
          gs.location_zone,
          sc.name AS category_name,
          sc.display_badge
        FROM gaming_sessions s
        JOIN gaming_stations gs ON s.station_id = gs.station_id
        JOIN station_categories sc ON gs.category_id = sc.category_id
        WHERE s.user_id = ?
        ORDER BY s.session_id DESC
        LIMIT 20
      `, [userId]);

      const activeSession = rows.find(r => r.status === 'ACTIVE') || null;
      return res.json({ activeSession, history: rows });
    } else {
      const userSessions = memoryState.gaming_sessions
        .filter(s => s.user_id === userId)
        .map(s => {
          const station = memoryState.gaming_stations.find(st => st.station_id === s.station_id) || {};
          const cat = memoryState.station_categories.find(c => c.category_id === station.category_id) || {};
          const liveMins = s.status === 'ACTIVE' 
            ? Math.round((Date.now() - new Date(s.start_time).getTime()) / 60000)
            : s.duration_minutes;

          return {
            ...s,
            live_minutes: liveMins,
            station_code: station.station_code,
            station_name: station.station_name,
            featured_game: station.featured_game,
            location_zone: station.location_zone,
            category_name: cat.name,
            display_badge: cat.display_badge
          };
        })
        .sort((a, b) => b.session_id - a.session_id);

      const activeSession = userSessions.find(s => s.status === 'ACTIVE') || null;
      return res.json({ activeSession, history: userSessions });
    }
  } catch (err) {
    next(err);
  }
});

// Start a gaming session (triggers sp_start_gaming_session)
router.post('/start', authenticateToken, async (req, res, next) => {
  try {
    const targetUserId = req.body.user_id || req.user.user_id;
    const { station_id } = req.body;
    const staffId = req.user.role === 'STAFF' || req.user.role === 'ADMIN' ? req.user.user_id : null;

    if (!station_id) {
      return res.status(400).json({ error: 'Station ID is required.' });
    }

    if (isLive()) {
      const pool = getPool();
      // Invoke Stored Procedure
      const [result] = await pool.query(
        'CALL sp_start_gaming_session(?, ?, ?, @p_session_id)',
        [targetUserId, station_id, staffId]
      );
      const [outRows] = await pool.query('SELECT @p_session_id AS session_id');
      const sessionId = outRows[0]?.session_id;

      return res.status(201).json({
        success: true,
        message: 'Gaming session started successfully.',
        session_id: sessionId
      });
    } else {
      const result = executeSimulation('sp_start_gaming_session', [targetUserId, station_id, staffId]);
      return res.status(201).json({
        success: true,
        message: 'Gaming session started successfully.',
        session_id: result.session_id
      });
    }
  } catch (err) {
    next(err);
  }
});

// Checkout & settle session (triggers sp_checkout_session)
router.post('/checkout', authenticateToken, async (req, res, next) => {
  try {
    const { session_id, payment_method } = req.body;
    const method = payment_method || 'WALLET';

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    if (isLive()) {
      const pool = getPool();
      // Call checkout stored procedure
      await pool.query(
        'CALL sp_checkout_session(?, ?, @p_total_billed, @p_invoice_id)',
        [session_id, method]
      );
      const [outRows] = await pool.query('SELECT @p_total_billed AS total_billed, @p_invoice_id AS invoice_id');
      const out = outRows[0] || {};

      return res.json({
        success: true,
        message: 'Gaming session checked out and settled successfully.',
        total_billed: out.total_billed,
        invoice_id: out.invoice_id
      });
    } else {
      const result = executeSimulation('sp_checkout_session', [session_id, method]);
      return res.json({
        success: true,
        message: 'Gaming session checked out and settled successfully.',
        total_billed: result.total_billed,
        invoice_number: result.invoice_number
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
