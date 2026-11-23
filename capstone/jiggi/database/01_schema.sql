-- =============================================================================
-- VORTEX LOUNGE - High-Performance Esports Lounge & Gaming Café
-- Relational Database Schema (MySQL 8.0+ / MySQL Workbench Compatible)
-- Script 01: Core Tables, Constraints, Foreign Keys & Indexes (3NF)
-- =============================================================================

DROP DATABASE IF EXISTS vortex_lounge;
CREATE DATABASE vortex_lounge 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE vortex_lounge;

-- -----------------------------------------------------------------------------
-- 1. Identity, Access Management & Player Profiles
-- -----------------------------------------------------------------------------

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PLAYER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'PLAYER',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE membership_tiers (
    tier_id INT AUTO_INCREMENT PRIMARY KEY,
    tier_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    hourly_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (hourly_discount_percent >= 0.00 AND hourly_discount_percent <= 100.00),
    snack_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (snack_discount_percent >= 0.00 AND snack_discount_percent <= 100.00),
    min_points_required INT NOT NULL DEFAULT 0 CHECK (min_points_required >= 0),
    monthly_fee DECIMAL(8,2) NOT NULL DEFAULT 0.00 CHECK (monthly_fee >= 0.00),
    perks_description TEXT NULL,
    badge_color VARCHAR(20) NOT NULL DEFAULT '#64748b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE player_profiles (
    player_id INT PRIMARY KEY,
    tier_id INT NOT NULL DEFAULT 1,
    loyalty_points INT NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    total_play_minutes INT NOT NULL DEFAULT 0 CHECK (total_play_minutes >= 0),
    membership_expires_at DATE NULL,
    preferred_zone VARCHAR(50) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_player_profiles_user FOREIGN KEY (player_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_profiles_tier FOREIGN KEY (tier_id) REFERENCES membership_tiers(tier_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. Digital Wallet & Transactions Ledger
-- -----------------------------------------------------------------------------

CREATE TABLE player_wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    last_topup_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE wallet_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('TOPUP', 'SESSION_DEDUCTION', 'CAFE_PURCHASE', 'REFUND', 'PROMO_CREDIT') NOT NULL,
    reference_id VARCHAR(100) NULL,
    description VARCHAR(255) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_tx_wallet (wallet_id),
    INDEX idx_wallet_tx_type (transaction_type),
    CONSTRAINT fk_wallet_tx_wallet FOREIGN KEY (wallet_id) REFERENCES player_wallets(wallet_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. Gaming Hardware, Station Categories & Catalog
-- -----------------------------------------------------------------------------

CREATE TABLE station_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    base_hourly_rate DECIMAL(8,2) NOT NULL CHECK (base_hourly_rate > 0.00),
    description VARCHAR(255) NOT NULL,
    display_badge VARCHAR(50) NOT NULL,
    specs_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE gaming_stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(20) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    location_zone VARCHAR(50) NOT NULL,
    mac_ip_address VARCHAR(45) NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stations_status (status),
    INDEX idx_stations_zone (location_zone),
    CONSTRAINT fk_stations_category FOREIGN KEY (category_id) REFERENCES station_categories(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE games_catalog (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    cover_image_url VARCHAR(255) NULL,
    supported_platforms VARCHAR(100) NOT NULL DEFAULT 'PC',
    is_installed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. Advance Bookings, Live Gaming Sessions & Billing
-- -----------------------------------------------------------------------------

CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'CONFIRMED',
    deposit_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_station_time (station_id, start_time, end_time),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_station FOREIGN KEY (station_id) REFERENCES gaming_stations(station_id) ON DELETE RESTRICT,
    CONSTRAINT chk_booking_time CHECK (end_time > start_time)
) ENGINE=InnoDB;

CREATE TABLE gaming_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NULL,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    staff_checkin_id INT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    duration_minutes INT NOT NULL DEFAULT 0,
    hourly_rate_applied DECIMAL(8,2) NOT NULL,
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('ACTIVE', 'COMPLETED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    payment_status ENUM('PENDING', 'PAID_WALLET', 'PAID_CARD', 'PAID_CASH', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_station (station_id),
    INDEX idx_sessions_status (status),
    CONSTRAINT fk_sessions_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sessions_station FOREIGN KEY (station_id) REFERENCES gaming_stations(station_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sessions_staff FOREIGN KEY (staff_checkin_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    session_id INT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('PAID', 'UNPAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_invoices_user (user_id),
    CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_session FOREIGN KEY (session_id) REFERENCES gaming_sessions(session_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('WALLET', 'CREDIT_CARD', 'CASH', 'UPI') NOT NULL,
    payment_reference VARCHAR(100) NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payments_invoice (invoice_id),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. Café, Beverage Bar & Lounge Food Operations
-- -----------------------------------------------------------------------------

CREATE TABLE cafe_categories (
    cafe_cat_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE cafe_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    cafe_cat_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    price DECIMAL(8,2) NOT NULL CHECK (price >= 0.00),
    cost_price DECIMAL(8,2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0.00),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cafe_category (cafe_cat_id),
    CONSTRAINT fk_cafe_items_category FOREIGN KEY (cafe_cat_id) REFERENCES cafe_categories(cafe_cat_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE cafe_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NULL,
    station_id INT NULL,
    order_status ENUM('PLACED', 'PREPARING', 'SERVED', 'CANCELLED') NOT NULL DEFAULT 'PLACED',
    payment_status ENUM('PAID', 'PENDING', 'CHARGED_TO_WALLET') NOT NULL DEFAULT 'PENDING',
    payment_method ENUM('WALLET', 'CREDIT_CARD', 'CASH') NOT NULL DEFAULT 'WALLET',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_note VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cafe_orders_user (user_id),
    INDEX idx_cafe_orders_status (order_status),
    CONSTRAINT fk_cafe_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cafe_orders_session FOREIGN KEY (session_id) REFERENCES gaming_sessions(session_id) ON DELETE SET NULL,
    CONSTRAINT fk_cafe_orders_station FOREIGN KEY (station_id) REFERENCES gaming_stations(station_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE cafe_order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    INDEX idx_order_items_order (order_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES cafe_orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_item FOREIGN KEY (item_id) REFERENCES cafe_items(item_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. Lounge Staff, Shift Scheduling, Attendance & Payroll
-- -----------------------------------------------------------------------------

CREATE TABLE staff_profiles (
    staff_id INT PRIMARY KEY,
    job_title VARCHAR(50) NOT NULL,
    hourly_wage DECIMAL(8,2) NOT NULL CHECK (hourly_wage > 0.00),
    hire_date DATE NOT NULL,
    emergency_contact VARCHAR(100) NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_profiles_user FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE staff_shifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    actual_start DATETIME NULL,
    actual_end DATETIME NULL,
    late_minutes INT NOT NULL DEFAULT 0,
    status ENUM('SCHEDULED', 'ON_DUTY', 'COMPLETED', 'ABSENT', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_staff_shifts_staff (staff_id),
    INDEX idx_staff_shifts_time (scheduled_start, scheduled_end),
    CONSTRAINT fk_staff_shifts_user FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE staff_leaves (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    leave_type ENUM('VACATION', 'SICK', 'PERSONAL', 'EMERGENCY') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    approved_by INT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_at TIMESTAMP NULL,
    INDEX idx_staff_leaves_staff (staff_id),
    CONSTRAINT fk_staff_leaves_user FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_leaves_approver FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE staff_payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    regular_hours DECIMAL(6,2) NOT NULL DEFAULT 0.00 CHECK (regular_hours >= 0.00),
    overtime_hours DECIMAL(6,2) NOT NULL DEFAULT 0.00 CHECK (overtime_hours >= 0.00),
    hourly_rate DECIMAL(8,2) NOT NULL,
    base_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    overtime_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    bonus DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (bonus >= 0.00),
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (deductions >= 0.00),
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('DRAFT', 'APPROVED', 'DISBURSED') NOT NULL DEFAULT 'DRAFT',
    disbursed_at TIMESTAMP NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_staff_payroll_period (pay_period_start, pay_period_end),
    UNIQUE KEY uq_staff_pay_period (staff_id, pay_period_start, pay_period_end),
    CONSTRAINT fk_staff_payroll_user FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
