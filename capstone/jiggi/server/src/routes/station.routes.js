const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// List all gaming stations with category & active session info
router.get('/', async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT 
          gs.station_id,
          gs.station_code,
          gs.status,
          gs.location_zone,
          gs.mac_ip_address,
          gs.notes,
          sc.category_id,
          sc.category_code,
          sc.name AS category_name,
          sc.base_hourly_rate,
          sc.display_badge,
          sc.specs_json,
          active_s.session_id AS active_session_id,
          active_s.user_id AS active_user_id,
          active_s.start_time AS active_session_start,
          u.username AS active_player_username,
          u.full_name AS active_player_name
        FROM gaming_stations gs
        JOIN station_categories sc ON gs.category_id = sc.category_id
        LEFT JOIN gaming_sessions active_s ON gs.station_id = active_s.station_id AND active_s.status = 'ACTIVE'
        LEFT JOIN users u ON active_s.user_id = u.user_id
        ORDER BY gs.station_id ASC
      `);
      return res.json({ stations: rows });
    } else {
      const stations = memoryState.gaming_stations.map(gs => {
        const cat = memoryState.station_categories.find(c => c.category_id === gs.category_id) || {};
        const activeSession = memoryState.gaming_sessions.find(s => s.station_id === gs.station_id && s.status === 'ACTIVE');
        const activeUser = activeSession ? memoryState.users.find(u => u.user_id === activeSession.user_id) : null;

        return {
          station_id: gs.station_id,
          station_code: gs.station_code,
          station_name: gs.station_name,
          status: gs.status,
          location_zone: gs.location_zone,
          mac_ip_address: gs.mac_ip_address,
          notes: gs.notes,
          image_url: gs.image_url || cat.image_url,
          featured_game: gs.featured_game,
          category_id: cat.category_id,
          category_code: cat.category_code,
          category_name: cat.name,
          base_hourly_rate: cat.base_hourly_rate,
          display_badge: cat.display_badge,
          specs_json: cat.specs_json,
          active_session_id: activeSession ? activeSession.session_id : null,
          active_user_id: activeSession ? activeSession.user_id : null,
          active_session_start: activeSession ? activeSession.start_time : null,
          active_player_username: activeUser ? activeUser.username : null,
          active_player_name: activeUser ? activeUser.full_name : null
        };
      });
      return res.json({ stations });
    }
  } catch (err) {
    next(err);
  }
});

// List station categories and pricing tiers
router.get('/categories', async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM station_categories ORDER BY category_id ASC');
      return res.json({ categories: rows });
    } else {
      return res.json({ categories: memoryState.station_categories });
    }
  } catch (err) {
    next(err);
  }
});

// List pre-installed esports games catalog
router.get('/games', async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM games_catalog WHERE is_installed = TRUE ORDER BY game_id ASC');
      return res.json({ games: rows });
    } else {
      return res.json({ games: memoryState.games_catalog || [] });
    }
  } catch (err) {
    next(err);
  }
});

// Update station status (e.g. toggle Maintenance, Available)
router.patch('/:id/status', authenticateToken, requireRole(['STAFF', 'ADMIN']), async (req, res, next) => {
  try {
    const stationId = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    if (isLive()) {
      const pool = getPool();
      await pool.query(
        'UPDATE gaming_stations SET status = ?, notes = COALESCE(?, notes) WHERE station_id = ?',
        [status, notes || null, stationId]
      );
      return res.json({ success: true, station_id: stationId, status });
    } else {
      const station = memoryState.gaming_stations.find(s => s.station_id === stationId);
      if (!station) return res.status(404).json({ error: 'Station not found.' });

      station.status = status;
      if (notes) station.notes = notes;
      return res.json({ success: true, station_id: stationId, status });
    }
  } catch (err) {
    next(err);
  }
});

// Add new station (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { station_code, category_id, location_zone, mac_ip_address, notes } = req.body;
    if (!station_code || !category_id || !location_zone) {
      return res.status(400).json({ error: 'Station code, category, and zone are required.' });
    }

    if (isLive()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO gaming_stations (station_code, category_id, location_zone, mac_ip_address, notes) VALUES (?, ?, ?, ?, ?)',
        [station_code.trim(), category_id, location_zone.trim(), mac_ip_address || null, notes || null]
      );
      return res.status(201).json({ success: true, station_id: result.insertId });
    } else {
      const newStation = {
        station_id: memoryState.gaming_stations.length + 1,
        station_code: station_code.trim(),
        category_id: parseInt(category_id, 10),
        status: 'AVAILABLE',
        location_zone: location_zone.trim(),
        mac_ip_address: mac_ip_address || null,
        notes: notes || null
      };
      memoryState.gaming_stations.push(newStation);
      return res.status(201).json({ success: true, station: newStation });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
