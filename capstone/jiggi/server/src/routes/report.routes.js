const express = require('express');
const router = express.Router();
const { isLive, getPool, memoryState } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Station Utilization View
router.get('/utilization', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM vw_station_utilization_analytics ORDER BY total_gaming_revenue DESC');
      return res.json({ report: rows });
    } else {
      const report = memoryState.gaming_stations.map(gs => {
        const cat = memoryState.station_categories.find(c => c.category_id === gs.category_id) || {};
        const sessions = memoryState.gaming_sessions.filter(s => s.station_id === gs.station_id && s.status === 'COMPLETED');
        const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
        const totalRevenue = sessions.reduce((acc, s) => acc + s.total_amount, 0);
        const avgMins = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;
        const utilPct = Math.round((totalMinutes / (30 * 16 * 60)) * 1000) / 10;

        return {
          station_id: gs.station_id,
          station_code: gs.station_code,
          location_zone: gs.location_zone,
          current_status: gs.status,
          category_name: cat.name,
          base_hourly_rate: cat.base_hourly_rate,
          total_sessions_hosted: sessions.length,
          total_minutes_logged: totalMinutes,
          total_hours_logged: Math.round((totalMinutes / 60) * 10) / 10,
          total_gaming_revenue: Math.round(totalRevenue * 100) / 100,
          avg_session_minutes: avgMins,
          monthly_utilization_percentage: utilPct
        };
      }).sort((a, b) => b.total_gaming_revenue - a.total_gaming_revenue);

      return res.json({ report });
    }
  } catch (err) {
    next(err);
  }
});

// Daily Revenue Breakdown View (in INR)
router.get('/revenue', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM vw_daily_revenue_breakdown LIMIT 14');
      return res.json({ report: rows });
    } else {
      const report = [
        { sale_date: '2026-11-19', gaming_revenue: 14850.00, cafe_revenue: 7200.00, wallet_topups: 16000.00, net_operational_revenue: 22050.00, completed_sessions_count: 32, cafe_orders_count: 24 },
        { sale_date: '2026-11-18', gaming_revenue: 19400.00, cafe_revenue: 9650.00, wallet_topups: 22000.00, net_operational_revenue: 29050.00, completed_sessions_count: 45, cafe_orders_count: 36 },
        { sale_date: '2026-11-17', gaming_revenue: 16200.00, cafe_revenue: 8100.00, wallet_topups: 18500.00, net_operational_revenue: 24300.00, completed_sessions_count: 38, cafe_orders_count: 28 },
        { sale_date: '2026-11-16', gaming_revenue: 13500.00, cafe_revenue: 6900.00, wallet_topups: 14000.00, net_operational_revenue: 20400.00, completed_sessions_count: 30, cafe_orders_count: 22 },
        { sale_date: '2026-11-15', gaming_revenue: 28900.00, cafe_revenue: 14200.00, wallet_topups: 35000.00, net_operational_revenue: 43100.00, completed_sessions_count: 62, cafe_orders_count: 48 }
      ];
      return res.json({ report });
    }
  } catch (err) {
    next(err);
  }
});

// Peak Gaming Hours View
router.get('/peak-hours', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM vw_peak_gaming_hours');
      return res.json({ report: rows });
    } else {
      const report = [
        { hour_of_day: 20, total_sessions_started: 18, avg_duration_minutes: 135, gross_revenue_generated: 8400.00, unique_players_active: 16, unique_stations_occupied: 14 },
        { hour_of_day: 21, total_sessions_started: 15, avg_duration_minutes: 120, gross_revenue_generated: 7200.00, unique_players_active: 14, unique_stations_occupied: 13 },
        { hour_of_day: 19, total_sessions_started: 14, avg_duration_minutes: 110, gross_revenue_generated: 6100.00, unique_players_active: 12, unique_stations_occupied: 11 },
        { hour_of_day: 18, total_sessions_started: 11, avg_duration_minutes: 95, gross_revenue_generated: 4800.00, unique_players_active: 10, unique_stations_occupied: 9 },
        { hour_of_day: 16, total_sessions_started: 8, avg_duration_minutes: 85, gross_revenue_generated: 3200.00, unique_players_active: 8, unique_stations_occupied: 7 },
        { hour_of_day: 14, total_sessions_started: 6, avg_duration_minutes: 75, gross_revenue_generated: 2400.00, unique_players_active: 6, unique_stations_occupied: 5 }
      ];
      return res.json({ report });
    }
  } catch (err) {
    next(err);
  }
});

// Top Café Performers View
router.get('/cafe', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM vw_top_cafe_performers');
      return res.json({ report: rows });
    } else {
      const report = memoryState.cafe_items.map(item => {
        const cat = memoryState.cafe_categories.find(c => c.cafe_cat_id === item.cafe_cat_id);
        const unitsSold = item.item_id === 1 ? 42 : item.item_id === 8 ? 38 : item.item_id === 9 ? 28 : 15;
        const gross = Math.round(unitsSold * item.price * 100) / 100;
        const cogs = Math.round(unitsSold * item.cost_price * 100) / 100;
        const profit = Math.round((gross - cogs) * 100) / 100;
        const margin = gross > 0 ? Math.round((profit / gross) * 1000) / 10 : 0;

        return {
          item_id: item.item_id,
          item_name: item.name,
          category_name: cat ? cat.name : 'Snacks',
          retail_price: item.price,
          cost_price: item.cost_price,
          current_stock: item.stock_quantity,
          units_sold: unitsSold,
          gross_sales_revenue: gross,
          total_cost_of_goods: cogs,
          net_profit: profit,
          profit_margin_percent: margin
        };
      }).sort((a, b) => b.gross_sales_revenue - a.gross_sales_revenue);

      return res.json({ report });
    }
  } catch (err) {
    next(err);
  }
});

// Staff Attendance Summary View
router.get('/staff', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM vw_staff_attendance_summary');
      return res.json({ report: rows });
    } else {
      const report = memoryState.staff_profiles.map(sp => {
        const u = memoryState.users.find(usr => usr.user_id === sp.staff_id) || {};
        const shifts = memoryState.staff_shifts.filter(s => s.staff_id === sp.staff_id);
        const completed = shifts.filter(s => s.status === 'COMPLETED');
        const lates = shifts.filter(s => s.late_minutes > 0);
        const lateMinutes = shifts.reduce((acc, s) => acc + s.late_minutes, 0);
        const hours = completed.length * 8;

        return {
          staff_id: sp.staff_id,
          full_name: u.full_name,
          email: u.email,
          job_title: sp.job_title,
          hourly_wage: sp.hourly_wage,
          total_shifts_scheduled: shifts.length,
          completed_shifts_count: completed.length,
          late_shift_occurrences: lates.length,
          total_late_minutes: lateMinutes,
          total_actual_hours_worked: hours,
          estimated_earned_wages: Math.round(hours * sp.hourly_wage * 100) / 100
        };
      });

      return res.json({ report });
    }
  } catch (err) {
    next(err);
  }
});

// Player Loyalty Leaderboard View
router.get('/leaderboard', authenticateToken, requireRole(['ADMIN', 'STAFF']), async (req, res, next) => {
  try {
    if (isLive()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM vw_player_loyalty_leaderboard');
      return res.json({ report: rows });
    } else {
      const report = memoryState.player_profiles.map(pp => {
        const u = memoryState.users.find(usr => usr.user_id === pp.player_id) || {};
        const t = memoryState.membership_tiers.find(tier => tier.tier_id === pp.tier_id) || {};
        const w = memoryState.player_wallets.find(wlt => wlt.user_id === pp.player_id) || {};
        const sessions = memoryState.gaming_sessions.filter(s => s.user_id === pp.player_id);
        const gamingSpend = sessions.reduce((acc, s) => acc + s.total_amount, 0);

        return {
          user_id: pp.player_id,
          username: u.username,
          full_name: u.full_name,
          tier_name: t.name,
          hourly_discount_percent: t.hourly_discount_percent,
          loyalty_points: pp.loyalty_points,
          total_play_hours: Math.round((pp.total_play_minutes / 60) * 10) / 10,
          current_wallet_balance: w.balance || 0,
          lifetime_sessions: sessions.length,
          total_gaming_spend: Math.round(gamingSpend * 100) / 100,
          total_lounge_spend: Math.round((gamingSpend + 1200.00) * 100) / 100
        };
      }).sort((a, b) => b.total_lounge_spend - a.total_lounge_spend);

      return res.json({ report });
    }
  } catch (err) {
    next(err);
  }
});

// Executive Dashboard KPI Summary
router.get('/summary', authenticateToken, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const totalStations = memoryState.gaming_stations.length;
    const occupiedStations = memoryState.gaming_stations.filter(s => s.status === 'OCCUPIED').length;
    const activeFloorRate = Math.round((occupiedStations / totalStations) * 100);

    return res.json({
      summary: {
        activeFloorUtilizationPercent: activeFloorRate,
        totalStationsCount: totalStations,
        occupiedCount: occupiedStations,
        availableCount: memoryState.gaming_stations.filter(s => s.status === 'AVAILABLE').length,
        todayGrossRevenue: 28450.00,
        activeSessionsCount: memoryState.gaming_sessions.filter(s => s.status === 'ACTIVE').length,
        pendingCafeOrdersCount: memoryState.cafe_orders.filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING').length,
        onDutyStaffCount: memoryState.staff_shifts.filter(s => s.status === 'ON_DUTY').length
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
