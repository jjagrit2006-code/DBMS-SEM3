-- =============================================================================
-- VORTEX LOUNGE - High-Performance Esports Lounge & Gaming Café
-- Relational Database Schema (MySQL 8.0+ / MySQL Workbench Compatible)
-- Script 02: Stored Functions, Stored Procedures & Business Logic Triggers
-- =============================================================================

USE vortex_lounge;

-- -----------------------------------------------------------------------------
-- 1. Stored Functions
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS fn_calculate_session_charge;
DELIMITER //
CREATE FUNCTION fn_calculate_session_charge(
    p_minutes INT,
    p_category_id INT,
    p_user_id INT
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_base_rate DECIMAL(8,2) DEFAULT 10.00;
    DECLARE v_discount_percent DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_billable_minutes INT;
    DECLARE v_gross_amount DECIMAL(10,2);
    DECLARE v_net_amount DECIMAL(10,2);

    -- 15-minute minimum charge rule
    SET v_billable_minutes = GREATEST(COALESCE(p_minutes, 0), 15);

    -- Fetch base hourly rate for the station category
    SELECT COALESCE(base_hourly_rate, 10.00)
    INTO v_base_rate
    FROM station_categories
    WHERE category_id = p_category_id
    LIMIT 1;

    -- Fetch player membership discount tier
    SELECT COALESCE(mt.hourly_discount_percent, 0.00)
    INTO v_discount_percent
    FROM player_profiles pp
    JOIN membership_tiers mt ON pp.tier_id = mt.tier_id
    WHERE pp.player_id = p_user_id
    LIMIT 1;

    -- Prorate hourly rate by minute
    SET v_gross_amount = (v_base_rate / 60.0) * v_billable_minutes;
    
    -- Apply tier loyalty discount
    SET v_net_amount = v_gross_amount * (1.0 - (v_discount_percent / 100.0));

    -- Round to two decimal places
    RETURN ROUND(v_net_amount, 2);
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_calculate_net_pay;
DELIMITER //
CREATE FUNCTION fn_calculate_net_pay(
    p_regular_hours DECIMAL(6,2),
    p_overtime_hours DECIMAL(6,2),
    p_hourly_wage DECIMAL(8,2),
    p_deductions DECIMAL(8,2),
    p_bonus DECIMAL(8,2)
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE v_reg_pay DECIMAL(10,2);
    DECLARE v_ot_pay DECIMAL(10,2);
    DECLARE v_net DECIMAL(10,2);

    -- Overtime is compensated at 1.5x regular wage
    SET v_reg_pay = COALESCE(p_regular_hours, 0.00) * COALESCE(p_hourly_wage, 0.00);
    SET v_ot_pay  = COALESCE(p_overtime_hours, 0.00) * (COALESCE(p_hourly_wage, 0.00) * 1.5);
    
    SET v_net = (v_reg_pay + v_ot_pay + COALESCE(p_bonus, 0.00)) - COALESCE(p_deductions, 0.00);
    
    RETURN GREATEST(ROUND(v_net, 2), 0.00);
END //
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 2. Stored Procedures
-- -----------------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_start_gaming_session;
DELIMITER //
CREATE PROCEDURE sp_start_gaming_session(
    IN p_user_id INT,
    IN p_station_id INT,
    IN p_staff_id INT,
    OUT p_session_id INT
)
proc_label: BEGIN
    DECLARE v_station_status VARCHAR(20);
    DECLARE v_category_id INT;
    DECLARE v_base_rate DECIMAL(8,2);
    DECLARE v_active_session_count INT;

    -- Handlers for database exceptions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Verify station existence and lock row
    SELECT status, category_id
    INTO v_station_status, v_category_id
    FROM gaming_stations
    WHERE station_id = p_station_id
    FOR UPDATE;

    IF v_station_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gaming station not found.';
    END IF;

    IF v_station_status != 'AVAILABLE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Station is not currently available for check-in.';
    END IF;

    -- Verify user does not already have an active live session
    SELECT COUNT(*)
    INTO v_active_session_count
    FROM gaming_sessions
    WHERE user_id = p_user_id AND status = 'ACTIVE';

    IF v_active_session_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User already has an active gaming session.';
    END IF;

    -- Fetch category base rate
    SELECT base_hourly_rate
    INTO v_base_rate
    FROM station_categories
    WHERE category_id = v_category_id;

    -- Insert active session
    INSERT INTO gaming_sessions (
        user_id,
        station_id,
        staff_checkin_id,
        start_time,
        hourly_rate_applied,
        status,
        payment_status
    ) VALUES (
        p_user_id,
        p_station_id,
        p_staff_id,
        NOW(),
        v_base_rate,
        'ACTIVE',
        'PENDING'
    );

    SET p_session_id = LAST_INSERT_ID();

    -- Update station status
    UPDATE gaming_stations
    SET status = 'OCCUPIED'
    WHERE station_id = p_station_id;

    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_checkout_session;
DELIMITER //
CREATE PROCEDURE sp_checkout_session(
    IN p_session_id INT,
    IN p_payment_method VARCHAR(20),
    OUT p_total_billed DECIMAL(10,2),
    OUT p_invoice_id INT
)
proc_label: BEGIN
    DECLARE v_user_id INT;
    DECLARE v_station_id INT;
    DECLARE v_category_id INT;
    DECLARE v_start_time DATETIME;
    DECLARE v_session_status VARCHAR(20);
    DECLARE v_minutes INT;
    DECLARE v_gross_charge DECIMAL(10,2);
    DECLARE v_discount_amount DECIMAL(10,2);
    DECLARE v_final_charge DECIMAL(10,2);
    DECLARE v_wallet_balance DECIMAL(10,2);
    DECLARE v_inv_number VARCHAR(50);
    DECLARE v_base_rate DECIMAL(8,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock session record
    SELECT s.user_id, s.station_id, s.start_time, s.status, st.category_id, s.hourly_rate_applied
    INTO v_user_id, v_station_id, v_start_time, v_session_status, v_category_id, v_base_rate
    FROM gaming_sessions s
    JOIN gaming_stations st ON s.station_id = st.station_id
    WHERE s.session_id = p_session_id
    FOR UPDATE;

    IF v_session_status IS NULL OR v_session_status != 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session is not active or does not exist.';
    END IF;

    -- Compute duration in minutes (minimum 15 mins)
    SET v_minutes = TIMESTAMPDIFF(MINUTE, v_start_time, NOW());
    IF v_minutes < 15 THEN
        SET v_minutes = 15;
    END IF;

    -- Calculate charges via stored function
    SET v_final_charge = fn_calculate_session_charge(v_minutes, v_category_id, v_user_id);
    SET v_gross_charge = ROUND((v_base_rate / 60.0) * v_minutes, 2);
    SET v_discount_amount = GREATEST(v_gross_charge - v_final_charge, 0.00);

    -- Settle payment through wallet if selected
    IF p_payment_method = 'WALLET' THEN
        SELECT balance INTO v_wallet_balance
        FROM player_wallets
        WHERE user_id = v_user_id
        FOR UPDATE;

        IF v_wallet_balance < v_final_charge THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient wallet balance for session settlement.';
        END IF;

        -- Deduct from wallet
        UPDATE player_wallets
        SET balance = balance - v_final_charge
        WHERE user_id = v_user_id;

        -- Record wallet transaction
        INSERT INTO wallet_transactions (
            wallet_id,
            amount,
            transaction_type,
            reference_id,
            description,
            balance_after
        ) VALUES (
            (SELECT wallet_id FROM player_wallets WHERE user_id = v_user_id),
            -v_final_charge,
            'SESSION_DEDUCTION',
            CONCAT('SESS-', p_session_id),
            CONCAT('Gaming session payment (', v_minutes, ' mins)'),
            v_wallet_balance - v_final_charge
        );
    END IF;

    -- Update session record
    UPDATE gaming_sessions
    SET end_time = NOW(),
        duration_minutes = v_minutes,
        subtotal_amount = v_gross_charge,
        discount_amount = v_discount_amount,
        total_amount = v_final_charge,
        status = 'COMPLETED',
        payment_status = CASE 
            WHEN p_payment_method = 'WALLET' THEN 'PAID_WALLET'
            WHEN p_payment_method = 'CREDIT_CARD' THEN 'PAID_CARD'
            WHEN p_payment_method = 'CASH' THEN 'PAID_CASH'
            ELSE 'PAID_CARD'
        END
    WHERE session_id = p_session_id;

    -- Generate Invoice
    SET v_inv_number = CONCAT('INV-', YEAR(NOW()), '-', LPAD(p_session_id, 6, '0'));
    
    INSERT INTO invoices (
        invoice_number,
        user_id,
        session_id,
        subtotal,
        tax_amount,
        discount_amount,
        grand_total,
        payment_status
    ) VALUES (
        v_inv_number,
        v_user_id,
        p_session_id,
        v_gross_charge,
        0.00,
        v_discount_amount,
        v_final_charge,
        'PAID'
    );

    SET p_invoice_id = LAST_INSERT_ID();

    -- Record Payment
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        payment_reference
    ) VALUES (
        p_invoice_id,
        v_final_charge,
        p_payment_method,
        CONCAT('TXN-', UNIX_TIMESTAMP(), '-', p_session_id)
    );

    -- Free up station
    UPDATE gaming_stations
    SET status = 'AVAILABLE'
    WHERE station_id = v_station_id;

    -- Update player total play minutes
    UPDATE player_profiles
    SET total_play_minutes = total_play_minutes + v_minutes
    WHERE player_id = v_user_id;

    SET p_total_billed = v_final_charge;

    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_topup_wallet;
DELIMITER //
CREATE PROCEDURE sp_topup_wallet(
    IN p_user_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_method VARCHAR(20),
    IN p_ref VARCHAR(100),
    OUT p_new_balance DECIMAL(10,2)
)
BEGIN
    DECLARE v_wallet_id INT;
    DECLARE v_current_balance DECIMAL(10,2);
    DECLARE v_points_earned INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Top-up amount must be strictly greater than zero.';
    END IF;

    START TRANSACTION;

    -- Lock wallet row
    SELECT wallet_id, balance
    INTO v_wallet_id, v_current_balance
    FROM player_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        -- Create wallet if missing
        INSERT INTO player_wallets (user_id, balance, last_topup_at)
        VALUES (p_user_id, p_amount, NOW());
        SET v_wallet_id = LAST_INSERT_ID();
        SET p_new_balance = p_amount;
    ELSE
        UPDATE player_wallets
        SET balance = balance + p_amount,
            last_topup_at = NOW()
        WHERE wallet_id = v_wallet_id;
        SET p_new_balance = v_current_balance + p_amount;
    END IF;

    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id,
        amount,
        transaction_type,
        reference_id,
        description,
        balance_after
    ) VALUES (
        v_wallet_id,
        p_amount,
        'TOPUP',
        p_ref,
        CONCAT('Digital wallet credit top-up via ', p_method),
        p_new_balance
    );

    -- Reward loyalty points (1 point per whole dollar)
    SET v_points_earned = FLOOR(p_amount);
    UPDATE player_profiles
    SET loyalty_points = loyalty_points + v_points_earned
    WHERE player_id = p_user_id;

    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_generate_staff_payroll;
DELIMITER //
CREATE PROCEDURE sp_generate_staff_payroll(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_staff_id INT
)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_curr_staff_id INT;
    DECLARE v_hourly_wage DECIMAL(8,2);
    DECLARE v_total_hours DECIMAL(6,2);
    DECLARE v_reg_hours DECIMAL(6,2);
    DECLARE v_ot_hours DECIMAL(6,2);
    DECLARE v_base_pay DECIMAL(10,2);
    DECLARE v_ot_pay DECIMAL(10,2);
    DECLARE v_net_pay DECIMAL(10,2);

    -- Cursor to iterate over staff members
    DECLARE staff_cur CURSOR FOR
        SELECT sp.staff_id, sp.hourly_wage
        FROM staff_profiles sp
        WHERE sp.status = 'ACTIVE'
          AND (p_staff_id IS NULL OR sp.staff_id = p_staff_id);

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    OPEN staff_cur;

    read_loop: LOOP
        FETCH staff_cur INTO v_curr_staff_id, v_hourly_wage;
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        -- Sum completed shift hours in the given period
        SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, actual_start, actual_end) / 60.0), 0.00)
        INTO v_total_hours
        FROM staff_shifts
        WHERE staff_id = v_curr_staff_id
          AND status = 'COMPLETED'
          AND actual_start IS NOT NULL
          AND actual_end IS NOT NULL
          AND DATE(scheduled_start) BETWEEN p_start_date AND p_end_date;

        -- Compute regular vs overtime (standard 40 hr threshold)
        IF v_total_hours > 40.00 THEN
            SET v_reg_hours = 40.00;
            SET v_ot_hours = v_total_hours - 40.00;
        ELSE
            SET v_reg_hours = v_total_hours;
            SET v_ot_hours = 0.00;
        END IF;

        SET v_base_pay = v_reg_hours * v_hourly_wage;
        SET v_ot_pay   = v_ot_hours * (v_hourly_wage * 1.5);
        SET v_net_pay  = fn_calculate_net_pay(v_reg_hours, v_ot_hours, v_hourly_wage, 0.00, 0.00);

        -- Upsert into staff_payroll
        INSERT INTO staff_payroll (
            staff_id,
            pay_period_start,
            pay_period_end,
            regular_hours,
            overtime_hours,
            hourly_rate,
            base_pay,
            overtime_pay,
            bonus,
            deductions,
            net_pay,
            payment_status
        ) VALUES (
            v_curr_staff_id,
            p_start_date,
            p_end_date,
            v_reg_hours,
            v_ot_hours,
            v_hourly_wage,
            v_base_pay,
            v_ot_pay,
            0.00,
            0.00,
            v_net_pay,
            'APPROVED'
        )
        ON DUPLICATE KEY UPDATE
            regular_hours = VALUES(regular_hours),
            overtime_hours = VALUES(overtime_hours),
            hourly_rate = VALUES(hourly_rate),
            base_pay = VALUES(base_pay),
            overtime_pay = VALUES(overtime_pay),
            net_pay = VALUES(net_pay),
            payment_status = 'APPROVED';

    END LOOP;

    CLOSE staff_cur;

    COMMIT;
END //
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 3. Business Triggers
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_after_cafe_order_item_insert;
DELIMITER //
CREATE TRIGGER trg_after_cafe_order_item_insert
AFTER INSERT ON cafe_order_items
FOR EACH ROW
BEGIN
    UPDATE cafe_items
    SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0)
    WHERE item_id = NEW.item_id;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_prevent_negative_wallet;
DELIMITER //
CREATE TRIGGER trg_prevent_negative_wallet
BEFORE UPDATE ON player_wallets
FOR EACH ROW
BEGIN
    IF NEW.balance < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Wallet balance cannot be negative.';
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_on_session_complete;
DELIMITER //
CREATE TRIGGER trg_on_session_complete
AFTER UPDATE ON gaming_sessions
FOR EACH ROW
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status = 'ACTIVE' THEN
        UPDATE gaming_stations
        SET status = 'AVAILABLE'
        WHERE station_id = NEW.station_id;
    END IF;
END //
DELIMITER ;
