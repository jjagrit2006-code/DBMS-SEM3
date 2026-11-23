const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState, executeSimulation } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get payroll slips
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    if (!isStaffOrAdmin) {
      return res.status(403).json({ error: 'Access restricted to lounge personnel.' });
    }

    const filterStaffId = req.user.role === 'ADMIN' ? req.query.staff_id : req.user.user_id;

    if (isLive()) {
      const pool = getPool();
      let query = `
        SELECT 
          p.*,
          u.full_name,
          u.username,
          sp.job_title
        FROM staff_payroll p
        JOIN users u ON p.staff_id = u.user_id
        JOIN staff_profiles sp ON p.staff_id = sp.staff_id
      `;
      const params = [];
      if (filterStaffId) {
        query += ' WHERE p.staff_id = ?';
        params.push(filterStaffId);
      }
      query += ' ORDER BY p.pay_period_end DESC, p.payroll_id DESC';

      const [rows] = await pool.query(query, params);
      return res.json({ payroll: rows });
    } else {
      let records = memoryState.staff_payroll;
      if (filterStaffId) {
        records = records.filter(p => p.staff_id === parseInt(filterStaffId, 10));
      }
      const mapped = records.map(p => {
        const u = memoryState.users.find(usr => usr.user_id === p.staff_id) || {};
        const sp = memoryState.staff_profiles.find(prof => prof.staff_id === p.staff_id) || {};
        return {
          ...p,
          full_name: u.full_name,
          username: u.username,
          job_title: sp.job_title
        };
      }).sort((a, b) => b.payroll_id - a.payroll_id);

      return res.json({ payroll: mapped });
    }
  } catch (err) {
    next(err);
  }
});

// Run payroll generation engine (Admin triggers sp_generate_staff_payroll)
router.post('/generate', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { start_date, end_date, staff_id } = req.body;
    const sDate = start_date || '2026-11-01';
    const eDate = end_date || '2026-11-30';
    const sId = staff_id ? parseInt(staff_id, 10) : null;

    if (isLive()) {
      const pool = getPool();
      await pool.query('CALL sp_generate_staff_payroll(?, ?, ?)', [sDate, eDate, sId]);
      return res.json({
        success: true,
        message: `Staff payroll generated successfully for pay period ${sDate} to ${eDate}.`
      });
    } else {
      const result = executeSimulation('sp_generate_staff_payroll', [sDate, eDate, sId]);
      return res.json({
        success: true,
        message: `Staff payroll generated successfully for pay period ${sDate} to ${eDate}.`,
        processed_count: result.processed_count
      });
    }
  } catch (err) {
    next(err);
  }
});

// Disburse payroll
router.patch('/:id/disburse', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const payrollId = parseInt(req.params.id, 10);

    if (isLive()) {
      const pool = getPool();
      await pool.query(
        'UPDATE staff_payroll SET payment_status = "DISBURSED", disbursed_at = NOW() WHERE payroll_id = ?',
        [payrollId]
      );
      return res.json({ success: true, payroll_id: payrollId, status: 'DISBURSED' });
    } else {
      const record = memoryState.staff_payroll.find(p => p.payroll_id === payrollId);
      if (!record) return res.status(404).json({ error: 'Payroll record not found' });
      record.payment_status = 'DISBURSED';
      return res.json({ success: true, payroll_id: payrollId, status: 'DISBURSED' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
