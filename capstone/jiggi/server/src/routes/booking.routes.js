const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get bookings
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    const userId = req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      let query = `
        SELECT 
          b.booking_id,
          b.user_id,
          b.station_id,
          b.start_time,
          b.end_time,
          b.status,
          b.deposit_amount,
          b.created_at,
          u.username,
          u.full_name,
          u.email,
          gs.station_code,
          gs.location_zone,
          sc.name AS category_name
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN gaming_stations gs ON b.station_id = gs.station_id
        JOIN station_categories sc ON gs.category_id = sc.category_id
      `;
      const params = [];
      if (!isStaffOrAdmin) {
        query += ' WHERE b.user_id = ?';
        params.push(userId);
      }
      query += ' ORDER BY b.start_time DESC';

      const [rows] = await pool.query(query, params);
      return res.json({ bookings: rows });
    } else {
      let filtered = memoryState.bookings;
      if (!isStaffOrAdmin) {
        filtered = filtered.filter(b => b.user_id === userId);
      }
      const bookings = filtered.map(b => {
        const u = memoryState.users.find(usr => usr.user_id === b.user_id) || {};
        const st = memoryState.gaming_stations.find(s => s.station_id === b.station_id) || {};
        const cat = memoryState.station_categories.find(c => c.category_id === st.category_id) || {};
        return {
          ...b,
          username: u.username,
          full_name: u.full_name,
          email: u.email,
          station_code: st.station_code,
          location_zone: st.location_zone,
          category_name: cat.name
        };
      });
      return res.json({ bookings });
    }
  } catch (err) {
    next(err);
  }
});

// Create new reservation
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.role === 'STAFF' || req.user.role === 'ADMIN' 
      ? (req.body.user_id || req.user.user_id)
      : req.user.user_id;
    const { station_id, start_time, end_time, deposit_amount } = req.body;

    if (!station_id || !start_time || !end_time) {
      return res.status(400).json({ error: 'Station ID, start time, and end time are required.' });
    }

    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'End time must be strictly after start time.' });
    }

    if (isLive()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO bookings (user_id, station_id, start_time, end_time, deposit_amount) VALUES (?, ?, ?, ?, ?)',
        [userId, station_id, new Date(start_time), new Date(end_time), deposit_amount || 15.00]
      );
      return res.status(201).json({ success: true, booking_id: result.insertId });
    } else {
      const newBooking = {
        booking_id: memoryState.bookings.length + 1,
        user_id: userId,
        station_id: parseInt(station_id, 10),
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        status: 'CONFIRMED',
        deposit_amount: deposit_amount || 15.00,
        created_at: new Date().toISOString()
      };
      memoryState.bookings.unshift(newBooking);
      return res.status(201).json({ success: true, booking: newBooking });
    }
  } catch (err) {
    next(err);
  }
});

// Check-in booking into live session
router.patch('/:id/checkin', authenticateToken, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const staffId = req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      const [bRows] = await pool.query('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
      if (bRows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      const b = bRows[0];

      await pool.query('CALL sp_start_gaming_session(?, ?, ?, @p_session_id)', [b.user_id, b.station_id, staffId]);
      await pool.query('UPDATE bookings SET status = "CHECKED_IN" WHERE booking_id = ?', [bookingId]);
      const [out] = await pool.query('SELECT @p_session_id AS session_id');

      return res.json({ success: true, session_id: out[0]?.session_id });
    } else {
      const b = memoryState.bookings.find(book => book.booking_id === bookingId);
      if (!b) return res.status(404).json({ error: 'Booking not found' });

      b.status = 'CHECKED_IN';
      const result = require('../config/db').executeSimulation('sp_start_gaming_session', [b.user_id, b.station_id, staffId]);
      return res.json({ success: true, session_id: result.session_id });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
