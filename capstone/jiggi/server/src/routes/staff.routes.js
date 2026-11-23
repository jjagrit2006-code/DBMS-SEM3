const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get staff roster (Admin)
router.get('/roster', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT 
          u.user_id,
          u.username,
          u.email,
          u.full_name,
          u.phone,
          u.avatar_url,
          sp.job_title,
          sp.hourly_wage,
          sp.hire_date,
          sp.emergency_contact,
          sp.status AS staff_status
        FROM users u
        JOIN staff_profiles sp ON u.user_id = sp.staff_id
        ORDER BY u.user_id ASC
      `);
      return res.json({ staff: rows });
    } else {
      const roster = memoryState.staff_profiles.map(sp => {
        const u = memoryState.users.find(usr => usr.user_id === sp.staff_id) || {};
        return {
          user_id: sp.staff_id,
          username: u.username,
          email: u.email,
          full_name: u.full_name,
          phone: u.phone,
          avatar_url: u.avatar_url,
          job_title: sp.job_title,
          hourly_wage: sp.hourly_wage,
          hire_date: sp.hire_date,
          emergency_contact: sp.emergency_contact,
          staff_status: sp.status
        };
      });
      return res.json({ staff: roster });
    }
  } catch (err) {
    next(err);
  }
});

// Get shift roster and attendance logs
router.get('/shifts', authenticateToken, async (req, res, next) => {
  try {
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    if (!isStaffOrAdmin) {
      return res.status(403).json({ error: 'Access restricted to lounge staff and managers.' });
    }

    const filterStaffId = req.user.role === 'ADMIN' ? req.query.staff_id : req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      let query = `
        SELECT 
          ss.*,
          u.full_name,
          u.username,
          sp.job_title,
          sp.hourly_wage
        FROM staff_shifts ss
        JOIN users u ON ss.staff_id = u.user_id
        JOIN staff_profiles sp ON ss.staff_id = sp.staff_id
      `;
      const params = [];
      if (filterStaffId) {
        query += ' WHERE ss.staff_id = ?';
        params.push(filterStaffId);
      }
      query += ' ORDER BY ss.scheduled_start DESC LIMIT 50';

      const [rows] = await pool.query(query, params);
      return res.json({ shifts: rows });
    } else {
      let shifts = memoryState.staff_shifts;
      if (filterStaffId) {
        shifts = shifts.filter(s => s.staff_id === parseInt(filterStaffId, 10));
      }
      const mapped = shifts.map(s => {
        const u = memoryState.users.find(usr => usr.user_id === s.staff_id) || {};
        const sp = memoryState.staff_profiles.find(p => p.staff_id === s.staff_id) || {};
        return {
          ...s,
          full_name: u.full_name,
          username: u.username,
          job_title: sp.job_title,
          hourly_wage: sp.hourly_wage
        };
      }).sort((a, b) => new Date(b.scheduled_start) - new Date(a.scheduled_start));

      return res.json({ shifts: mapped });
    }
  } catch (err) {
    next(err);
  }
});

// Staff Clock-In / Clock-Out
router.post('/timeclock', authenticateToken, requireRole(['STAFF', 'ADMIN']), async (req, res, next) => {
  try {
    const staffId = req.user.user_id;
    const { action } = req.body; // 'CLOCK_IN' or 'CLOCK_OUT'

    if (!['CLOCK_IN', 'CLOCK_OUT'].includes(action)) {
      return res.status(400).json({ error: 'Action must be CLOCK_IN or CLOCK_OUT.' });
    }

    if (isLive()) {
      const pool = getPool();
      if (action === 'CLOCK_IN') {
        // Find existing scheduled shift or create new shift
        const [shiftRows] = await pool.query(`
          SELECT * FROM staff_shifts 
          WHERE staff_id = ? AND status = 'SCHEDULED' AND scheduled_start <= NOW() + INTERVAL 2 HOUR 
          ORDER BY scheduled_start ASC LIMIT 1
        `, [staffId]);

        if (shiftRows.length > 0) {
          const shift = shiftRows[0];
          const lateMins = Math.max(0, Math.round((Date.now() - new Date(shift.scheduled_start).getTime()) / 60000));
          await pool.query(
            'UPDATE staff_shifts SET actual_start = NOW(), late_minutes = ?, status = "ON_DUTY" WHERE shift_id = ?',
            [lateMins, shift.shift_id]
          );
          return res.json({ success: true, message: 'Clocked in successfully on scheduled shift.', shift_id: shift.shift_id, late_minutes: lateMins });
        } else {
          // Unscheduled floor shift
          const [result] = await pool.query(`
            INSERT INTO staff_shifts (staff_id, scheduled_start, scheduled_end, actual_start, status, notes)
            VALUES (?, NOW(), NOW() + INTERVAL 8 HOUR, NOW(), 'ON_DUTY', 'Direct floor clock-in')
          `, [staffId]);
          return res.json({ success: true, message: 'Clocked in successfully (Unscheduled shift).', shift_id: result.insertId });
        }
      } else {
        // Clock out active shift
        const [onDuty] = await pool.query(`
          SELECT * FROM staff_shifts WHERE staff_id = ? AND status = 'ON_DUTY' ORDER BY actual_start DESC LIMIT 1
        `, [staffId]);

        if (onDuty.length === 0) {
          return res.status(400).json({ error: 'No active on-duty shift found to clock out.' });
        }

        await pool.query(
          'UPDATE staff_shifts SET actual_end = NOW(), status = "COMPLETED" WHERE shift_id = ?',
          [onDuty[0].shift_id]
        );
        return res.json({ success: true, message: 'Clocked out successfully.', shift_id: onDuty[0].shift_id });
      }
    } else {
      if (action === 'CLOCK_IN') {
        const scheduled = memoryState.staff_shifts.find(s => s.staff_id === staffId && s.status === 'SCHEDULED');
        if (scheduled) {
          scheduled.actual_start = new Date().toISOString();
          scheduled.status = 'ON_DUTY';
          return res.json({ success: true, message: 'Clocked in successfully on scheduled shift.', shift_id: scheduled.shift_id });
        } else {
          const newShift = {
            shift_id: memoryState.staff_shifts.length + 1,
            staff_id: staffId,
            scheduled_start: new Date().toISOString(),
            scheduled_end: new Date(Date.now() + 28800000).toISOString(),
            actual_start: new Date().toISOString(),
            actual_end: null,
            late_minutes: 0,
            status: 'ON_DUTY',
            notes: 'Direct floor clock-in'
          };
          memoryState.staff_shifts.unshift(newShift);
          return res.json({ success: true, message: 'Clocked in successfully.', shift_id: newShift.shift_id });
        }
      } else {
        const active = memoryState.staff_shifts.find(s => s.staff_id === staffId && s.status === 'ON_DUTY');
        if (!active) {
          return res.status(400).json({ error: 'No active on-duty shift found to clock out.' });
        }
        active.actual_end = new Date().toISOString();
        active.status = 'COMPLETED';
        return res.json({ success: true, message: 'Clocked out successfully.', shift_id: active.shift_id });
      }
    }
  } catch (err) {
    next(err);
  }
});

// Get staff leaves
router.get('/leaves', authenticateToken, requireRole(['STAFF', 'ADMIN']), async (req, res, next) => {
  try {
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    const filterStaffId = req.user.role === 'ADMIN' ? req.query.staff_id : req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      let query = `
        SELECT sl.*, u.full_name, u.username, approver.full_name AS approved_by_name
        FROM staff_leaves sl
        JOIN users u ON sl.staff_id = u.user_id
        LEFT JOIN users approver ON sl.approved_by = approver.user_id
      `;
      const params = [];
      if (filterStaffId) {
        query += ' WHERE sl.staff_id = ?';
        params.push(filterStaffId);
      }
      query += ' ORDER BY sl.leave_id DESC';

      const [rows] = await pool.query(query, params);
      return res.json({ leaves: rows });
    } else {
      let leaves = memoryState.staff_leaves;
      if (filterStaffId) {
        leaves = leaves.filter(l => l.staff_id === parseInt(filterStaffId, 10));
      }
      const mapped = leaves.map(l => {
        const u = memoryState.users.find(usr => usr.user_id === l.staff_id) || {};
        const approver = l.approved_by ? memoryState.users.find(usr => usr.user_id === l.approved_by) : null;
        return {
          ...l,
          full_name: u.full_name,
          username: u.username,
          approved_by_name: approver ? approver.full_name : null
        };
      });
      return res.json({ leaves: mapped });
    }
  } catch (err) {
    next(err);
  }
});

// Submit leave request
router.post('/leaves', authenticateToken, requireRole(['STAFF']), async (req, res, next) => {
  try {
    const staffId = req.user.user_id;
    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ error: 'Leave type, start date, end date, and reason are required.' });
    }

    if (isLive()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO staff_leaves (staff_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, "PENDING")',
        [staffId, leave_type, start_date, end_date, reason.trim()]
      );
      return res.status(201).json({ success: true, leave_id: result.insertId });
    } else {
      const newLeave = {
        leave_id: memoryState.staff_leaves.length + 1,
        staff_id: staffId,
        leave_type,
        start_date,
        end_date,
        reason: reason.trim(),
        status: 'PENDING',
        approved_by: null,
        decision_at: null
      };
      memoryState.staff_leaves.unshift(newLeave);
      return res.status(201).json({ success: true, leave: newLeave });
    }
  } catch (err) {
    next(err);
  }
});

// Approve / Reject Leave Request (Admin)
router.patch('/leaves/:id/status', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const leaveId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const adminId = req.user.user_id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
    }

    if (isLive()) {
      const pool = getPool();
      await pool.query(
        'UPDATE staff_leaves SET status = ?, approved_by = ?, decision_at = NOW() WHERE leave_id = ?',
        [status, adminId, leaveId]
      );
      return res.json({ success: true, leave_id: leaveId, status });
    } else {
      const leave = memoryState.staff_leaves.find(l => l.leave_id === leaveId);
      if (!leave) return res.status(404).json({ error: 'Leave request not found' });
      leave.status = status;
      leave.approved_by = adminId;
      leave.decision_at = new Date().toISOString();
      return res.json({ success: true, leave_id: leaveId, status });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
