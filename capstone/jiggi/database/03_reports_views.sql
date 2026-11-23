-- =============================================================================
-- VORTEX LOUNGE - High-Performance Esports Lounge & Gaming Café
-- Relational Database Schema (MySQL 8.0+ / MySQL Workbench Compatible)
-- Script 03: Complex Analytical Queries, Views & Business Intelligence
-- =============================================================================

USE vortex_lounge;

-- -----------------------------------------------------------------------------
-- 1. Gaming Station Utilization & Hardware Performance View
-- Multi-table JOIN, GROUP BY, aggregations, and utilization percentage
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS vw_station_utilization_analytics;
CREATE VIEW vw_station_utilization_analytics AS
SELECT 
    gs.station_id,
    gs.station_code,
    gs.location_zone,
    gs.status AS current_status,
    sc.name AS category_name,
    sc.base_hourly_rate,
    COUNT(s.session_id) AS total_sessions_hosted,
    COALESCE(SUM(s.duration_minutes), 0) AS total_minutes_logged,
    ROUND(COALESCE(SUM(s.duration_minutes), 0) / 60.0, 1) AS total_hours_logged,
    ROUND(COALESCE(SUM(s.total_amount), 0.00), 2) AS total_gaming_revenue,
    ROUND(COALESCE(AVG(s.duration_minutes), 0), 0) AS avg_session_minutes,
    ROUND(
        (COALESCE(SUM(s.duration_minutes), 0) / (30.0 * 16.0 * 60.0)) * 100.0, 
        1
    ) AS monthly_utilization_percentage
FROM gaming_stations gs
JOIN station_categories sc ON gs.category_id = sc.category_id
LEFT JOIN gaming_sessions s ON gs.station_id = s.station_id AND s.status = 'COMPLETED'
GROUP BY 
    gs.station_id, 
    gs.station_code, 
    gs.location_zone, 
    gs.status, 
    sc.name, 
    sc.base_hourly_rate;

-- -----------------------------------------------------------------------------
-- 2. Daily Lounge Revenue Breakdown View
-- Gaming sessions, Café orders, and Digital wallet top-ups aggregated by day
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS vw_daily_revenue_breakdown;
CREATE VIEW vw_daily_revenue_breakdown AS
SELECT 
    d.sale_date,
    COALESCE(sess.gaming_revenue, 0.00) AS gaming_revenue,
    COALESCE(cafe.cafe_revenue, 0.00) AS cafe_revenue,
    COALESCE(topup.wallet_topups, 0.00) AS wallet_topups,
    ROUND(COALESCE(sess.gaming_revenue, 0.00) + COALESCE(cafe.cafe_revenue, 0.00), 2) AS net_operational_revenue,
    COALESCE(sess.session_count, 0) AS completed_sessions_count,
    COALESCE(cafe.order_count, 0) AS cafe_orders_count
FROM (
    SELECT DISTINCT DATE(start_time) AS sale_date FROM gaming_sessions
    UNION
    SELECT DISTINCT DATE(created_at) AS sale_date FROM cafe_orders
    UNION
    SELECT DISTINCT DATE(created_at) AS sale_date FROM wallet_transactions WHERE transaction_type = 'TOPUP'
) d
LEFT JOIN (
    SELECT 
        DATE(start_time) AS report_date,
        COUNT(session_id) AS session_count,
        ROUND(SUM(total_amount), 2) AS gaming_revenue
    FROM gaming_sessions
    WHERE status = 'COMPLETED'
    GROUP BY DATE(start_time)
) sess ON d.sale_date = sess.report_date
LEFT JOIN (
    SELECT 
        DATE(created_at) AS report_date,
        COUNT(order_id) AS order_count,
        ROUND(SUM(total_amount), 2) AS cafe_revenue
    FROM cafe_orders
    WHERE order_status != 'CANCELLED'
    GROUP BY DATE(created_at)
) cafe ON d.sale_date = cafe.report_date
LEFT JOIN (
    SELECT 
        DATE(created_at) AS report_date,
        ROUND(SUM(amount), 2) AS wallet_topups
    FROM wallet_transactions
    WHERE transaction_type = 'TOPUP'
    GROUP BY DATE(created_at)
) topup ON d.sale_date = topup.report_date
ORDER BY d.sale_date DESC;

-- -----------------------------------------------------------------------------
-- 3. Peak Lounge Gaming Hours View
-- Analysis by 24-hour clock cycle
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS vw_peak_gaming_hours;
CREATE VIEW vw_peak_gaming_hours AS
SELECT 
    HOUR(s.start_time) AS hour_of_day,
    COUNT(s.session_id) AS total_sessions_started,
    ROUND(AVG(s.duration_minutes), 0) AS avg_duration_minutes,
    ROUND(SUM(s.total_amount), 2) AS gross_revenue_generated,
    COUNT(DISTINCT s.user_id) AS unique_players_active,
    COUNT(DISTINCT s.station_id) AS unique_stations_occupied
FROM gaming_sessions s
GROUP BY HOUR(s.start_time)
ORDER BY total_sessions_started DESC, gross_revenue_generated DESC;

-- -----------------------------------------------------------------------------
-- 4. Café & Snack Bar Sales & Profit Margin View
-- Evaluates bestsellers, COGS, gross sales, and net profit margins
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS vw_top_cafe_performers;
CREATE VIEW vw_top_cafe_performers AS
SELECT 
    ci.item_id,
    ci.name AS item_name,
    cc.name AS category_name,
    ci.price AS retail_price,
    ci.cost_price,
    ci.stock_quantity AS current_stock,
    COALESCE(SUM(coi.quantity), 0) AS units_sold,
    ROUND(COALESCE(SUM(coi.subtotal), 0.00), 2) AS gross_sales_revenue,
    ROUND(COALESCE(SUM(coi.quantity * ci.cost_price), 0.00), 2) AS total_cost_of_goods,
    ROUND(COALESCE(SUM(coi.subtotal), 0.00) - COALESCE(SUM(coi.quantity * ci.cost_price), 0.00), 2) AS net_profit,
    CASE 
        WHEN COALESCE(SUM(coi.subtotal), 0.00) > 0 THEN
            ROUND(((SUM(coi.subtotal) - SUM(coi.quantity * ci.cost_price)) / SUM(coi.subtotal)) * 100.0, 1)
        ELSE 0.0
    END AS profit_margin_percent
FROM cafe_items ci
JOIN cafe_categories cc ON ci.cafe_cat_id = cc.cafe_cat_id
LEFT JOIN cafe_order_items coi ON ci.item_id = coi.item_id
LEFT JOIN cafe_orders co ON coi.order_id = co.order_id AND co.order_status != 'CANCELLED'
GROUP BY 
    ci.item_id, 
    ci.name, 
    cc.name, 
    ci.price, 
    ci.cost_price, 
    ci.stock_quantity
ORDER BY gross_sales_revenue DESC, units_sold DESC;

-- -----------------------------------------------------------------------------
-- 5. Staff Attendance, Punctuality & Wage Summary View
-- Evaluates employee shifts, late minutes, hours worked, and estimated pay
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS vw_staff_attendance_summary;
CREATE VIEW vw_staff_attendance_summary AS
SELECT 
    u.user_id AS staff_id,
    u.full_name,
    u.email,
    sp.job_title,
    sp.hourly_wage,
    COUNT(ss.shift_id) AS total_shifts_scheduled,
    SUM(CASE WHEN ss.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_shifts_count,
    SUM(CASE WHEN ss.late_minutes > 0 THEN 1 ELSE 0 END) AS late_shift_occurrences,
    COALESCE(SUM(ss.late_minutes), 0) AS total_late_minutes,
    ROUND(
        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ss.actual_start, ss.actual_end) / 60.0), 0.00), 
        2
    ) AS total_actual_hours_worked,
    ROUND(
        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ss.actual_start, ss.actual_end) / 60.0), 0.00) * sp.hourly_wage, 
        2
    ) AS estimated_earned_wages
FROM users u
JOIN staff_profiles sp ON u.user_id = sp.staff_id
LEFT JOIN staff_shifts ss ON u.user_id = ss.staff_id
GROUP BY 
    u.user_id, 
    u.full_name, 
    u.email, 
    sp.job_title, 
    sp.hourly_wage;

-- -----------------------------------------------------------------------------
-- 6. Player Loyalty & Lounge Spending Leaderboard View
-- Player gaming activity, wallet status, and cumulative spend ranking
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS vw_player_loyalty_leaderboard;
CREATE VIEW vw_player_loyalty_leaderboard AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    mt.name AS tier_name,
    mt.hourly_discount_percent,
    pp.loyalty_points,
    ROUND(pp.total_play_minutes / 60.0, 1) AS total_play_hours,
    COALESCE(pw.balance, 0.00) AS current_wallet_balance,
    COUNT(DISTINCT s.session_id) AS lifetime_sessions,
    ROUND(COALESCE(SUM(s.total_amount), 0.00), 2) AS total_gaming_spend,
    ROUND(COALESCE(SUM(s.total_amount), 0.00) + COALESCE(cafe_spend.total_cafe, 0.00), 2) AS total_lounge_spend
FROM users u
JOIN player_profiles pp ON u.user_id = pp.player_id
JOIN membership_tiers mt ON pp.tier_id = mt.tier_id
LEFT JOIN player_wallets pw ON u.user_id = pw.user_id
LEFT JOIN gaming_sessions s ON u.user_id = s.user_id AND s.status = 'COMPLETED'
LEFT JOIN (
    SELECT 
        user_id, 
        SUM(total_amount) AS total_cafe 
    FROM cafe_orders 
    WHERE order_status != 'CANCELLED' 
    GROUP BY user_id
) cafe_spend ON u.user_id = cafe_spend.user_id
WHERE u.role = 'PLAYER'
GROUP BY 
    u.user_id, 
    u.username, 
    u.full_name, 
    mt.name, 
    mt.hourly_discount_percent, 
    pp.loyalty_points, 
    pp.total_play_minutes, 
    pw.balance,
    cafe_spend.total_cafe
ORDER BY total_lounge_spend DESC, pp.loyalty_points DESC;
