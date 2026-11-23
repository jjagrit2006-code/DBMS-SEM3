-- =============================================================================
-- VORTEX LOUNGE - High-Performance Esports Lounge & Gaming Café
-- Relational Database Schema (MySQL 8.0+ / MySQL Workbench Compatible)
-- Script 04: Production Seed Data (Users, Hardware, Games, Menu, Sessions)
-- Default Password for all seeded accounts: Password123!
-- =============================================================================

USE vortex_lounge;

-- -----------------------------------------------------------------------------
-- 1. Membership Tiers
-- -----------------------------------------------------------------------------
INSERT INTO membership_tiers (tier_id, tier_code, name, hourly_discount_percent, snack_discount_percent, min_points_required, monthly_fee, perks_description, badge_color) VALUES
(1, 'TIER_STD',  'Standard',    0.00,  0.00,     0,   0.00, 'Access to all standard arena stations, standard café menu pricing.', '#64748b'),
(2, 'TIER_SLV',  'Silver Gamer', 5.00,  5.00,   500,  15.00, '5% discount on all rigs, 5% off snacks, priority weekend queue.', '#94a3b8'),
(3, 'TIER_GLD',  'Gold Pro',    15.00, 10.00,  1500,  35.00, '15% hourly discount, 10% snack discount, free beverage per visit, reservation guarantee.', '#f59e0b'),
(4, 'TIER_VIP',  'Vortex VIP',  25.00, 15.00,  3000,  75.00, '25% hourly discount, 15% off café, unlimited sim racing access, VIP private booth booking.', '#06b6d4');

-- -----------------------------------------------------------------------------
-- 2. Users (Admin, Staff, Players)
-- Password hash for 'Password123!' (bcrypt $2b$10$wE7/L5QZp0vU4n8A4c...)
-- -----------------------------------------------------------------------------
INSERT INTO users (user_id, username, email, password_hash, role, full_name, phone, avatar_url) VALUES
-- Admin
(1, 'vortex_admin', 'admin@vortexlounge.com', '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'ADMIN', 'Marcus Vance', '+1 (555) 010-9000', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),

-- Staff
(2, 'elena_floor', 'elena@vortexlounge.com', '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'STAFF', 'Elena Rostova', '+1 (555) 012-3401', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(3, 'kai_tech',    'kai@vortexlounge.com',   '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'STAFF', 'Kai Tanaka',    '+1 (555) 012-3402', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(4, 'sarah_host',  'sarah.h@vortexlounge.com','$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'STAFF', 'Sarah Jenkins', '+1 (555) 012-3403', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),

-- Players
(5, 'apex_alex',   'alex@vortexgamer.com',   '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'PLAYER', 'Alex Rivera',   '+1 (555) 014-5501', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(6, 'neon_claire', 'claire@vortexgamer.com', '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'PLAYER', 'Claire DeWitt', '+1 (555) 014-5502', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
(7, 'sim_david',   'david@vortexgamer.com',  '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'PLAYER', 'David O’Connor','+1 (555) 014-5503', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
(8, 'pixel_maya',  'maya@vortexgamer.com',   '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'PLAYER', 'Maya Patel',    '+1 (555) 014-5504', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
(9, 'val_jordan',  'jordan@vortexgamer.com', '$2b$10$tZ26fJm62gK5fT0vL8o5UeJ6tA4/V1n8sL1m4a5c6d7e8f9g0h1i2', 'PLAYER', 'Jordan Brooks', '+1 (555) 014-5505', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150');

-- -----------------------------------------------------------------------------
-- 3. Staff Profiles
-- -----------------------------------------------------------------------------
INSERT INTO staff_profiles (staff_id, job_title, hourly_wage, hire_date, emergency_contact, status) VALUES
(2, 'Lounge Shift Lead',    26.50, '2024-03-15', 'Paul Rostova (+1-555-099-1122)', 'ACTIVE'),
(3, 'Systems & Net Engineer', 30.00, '2024-01-10', 'Hana Tanaka (+1-555-099-3344)', 'ACTIVE'),
(4, 'Guest Experience Host', 21.00, '2024-06-01', 'Mark Jenkins (+1-555-099-5566)', 'ACTIVE');

-- -----------------------------------------------------------------------------
-- 4. Player Profiles & Digital Wallets
-- -----------------------------------------------------------------------------
INSERT INTO player_profiles (player_id, tier_id, loyalty_points, total_play_minutes, membership_expires_at, preferred_zone) VALUES
(5, 4, 3850, 4820, '2027-12-31', 'VIP Elite Stage'),
(6, 3, 1920, 2450, '2027-08-30', 'Pro Arena'),
(7, 3, 1640, 1980, '2027-09-15', 'Sim Racing Pit'),
(8, 2,  750, 1120, '2027-04-10', 'Console Bay'),
(9, 1,  120,  280, NULL,         'Pro Arena');

INSERT INTO player_wallets (wallet_id, user_id, balance, currency, last_topup_at) VALUES
(1, 5, 142.50, 'USD', NOW() - INTERVAL 1 DAY),
(2, 6,  68.00, 'USD', NOW() - INTERVAL 3 DAY),
(3, 7,  85.00, 'USD', NOW() - INTERVAL 2 DAY),
(4, 8,  24.50, 'USD', NOW() - INTERVAL 5 DAY),
(5, 9,  15.00, 'USD', NOW() - INTERVAL 7 DAY);

INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, reference_id, description, balance_after, created_at) VALUES
(1, 100.00, 'TOPUP', 'TOP-9081', 'Digital wallet credit top-up via CREDIT_CARD', 100.00, NOW() - INTERVAL 5 DAY),
(1,  50.00, 'TOPUP', 'TOP-9099', 'Digital wallet credit top-up via CREDIT_CARD', 150.00, NOW() - INTERVAL 1 DAY),
(1,  -7.50, 'CAFE_PURCHASE', 'ORD-101', 'Café beverage: Monster Energy Ultra & Cookie', 142.50, NOW() - INTERVAL 1 DAY),
(2,  50.00, 'TOPUP', 'TOP-9085', 'Digital wallet credit top-up via UPI', 50.00, NOW() - INTERVAL 3 DAY),
(2,  25.00, 'TOPUP', 'TOP-9102', 'Digital wallet credit top-up via CREDIT_CARD', 75.00, NOW() - INTERVAL 3 DAY),
(2,  -7.00, 'SESSION_DEDUCTION', 'SESS-201', 'Gaming session payment (60 mins)', 68.00, NOW() - INTERVAL 2 DAY),
(3, 100.00, 'TOPUP', 'TOP-9088', 'Digital wallet credit top-up via CREDIT_CARD', 100.00, NOW() - INTERVAL 2 DAY),
(3, -15.00, 'SESSION_DEDUCTION', 'SESS-202', 'Sim Racing session (60 mins)', 85.00, NOW() - INTERVAL 1 DAY);

-- -----------------------------------------------------------------------------
-- 5. Station Hardware Categories & Gaming Rigs
-- -----------------------------------------------------------------------------
INSERT INTO station_categories (category_id, category_code, name, base_hourly_rate, description, display_badge, specs_json) VALUES
(1, 'PC_PRO', 'Esports Pro Arena', 8.00, 'High-FPS tournament tier stations optimized for competitive shooters and MOBAs.', '240Hz OLED',
 '{"gpu": "NVIDIA GeForce RTX 4080 Super 16GB", "cpu": "Intel Core i7-14700K 20-Core", "ram": "32GB DDR5-6000", "monitor": "27\\" ROG Swift 240Hz OLED 0.03ms", "peripherals": "Wooting 60HE + Logitech G Pro X Superlight 2"}'),

(2, 'PC_ELITE', 'VIP Elite Liquid Pod', 12.00, 'Top-tier luxury custom open-loop liquid-cooled battle rigs with ultra-wide 360Hz displays.', '360Hz Liquid',
 '{"gpu": "NVIDIA GeForce RTX 4090 OC 24GB", "cpu": "AMD Ryzen 7 7800X3D 8-Core 3D V-Cache", "ram": "64GB DDR5-6400", "monitor": "34\\" Alienware 360Hz QD-OLED Curved", "peripherals": "Custom Mechanical Keeb + Razer Viper Mini SE"}'),

(3, 'CONSOLE_PS5', 'Console Lounge Bay', 7.50, 'Private plush recliners with PlayStation 5 Pro & 4K 120Hz OLED gaming displays.', '4K 120Hz OLED',
 '{"console": "Sony PlayStation 5 Pro 2TB", "display": "55\\" LG C4 4K 120Hz OLED HDR Dolby Vision", "audio": "SteelSeries Arctis Nova Pro Wireless", "controllers": "DualSense Edge Wireless Controller"}'),

(4, 'SIM_RACING', 'Sim Racing Motion Pit', 18.00, 'Direct-drive force feedback cockpits with hydraulic load-cell pedals and triple panoramic surround screens.', 'Direct Drive Sim',
 '{"wheelbase": "Fanatec ClubSport DD+ 15Nm Direct Drive", "cockpit": "Next Level Racing GTTrack with Motion Platform V3", "pedals": "Heusinkveld Sim Pedals Sprint Load Cell", "displays": "Triple 32\\" 1440p 165Hz Curved"}');

INSERT INTO gaming_stations (station_id, station_code, category_id, status, location_zone, mac_ip_address, notes) VALUES
-- Pro Arena (PC-01 to PC-06)
(1,  'PC-01', 1, 'OCCUPIED',   'Pro Arena', '192.168.10.101', 'Row A - Center Stage'),
(2,  'PC-02', 1, 'AVAILABLE',  'Pro Arena', '192.168.10.102', 'Row A - Right Wing'),
(3,  'PC-03', 1, 'AVAILABLE',  'Pro Arena', '192.168.10.103', 'Row B - Left Wing'),
(4,  'PC-04', 1, 'OCCUPIED',   'Pro Arena', '192.168.10.104', 'Row B - Center Stage'),
(5,  'PC-05', 1, 'MAINTENANCE','Pro Arena', '192.168.10.105', 'DisplayPort cable swap scheduled'),
(6,  'PC-06', 1, 'AVAILABLE',  'Pro Arena', '192.168.10.106', 'Row C - Soundproof Booth'),

-- VIP Elite Stage (VIP-01 to VIP-04)
(7,  'VIP-01', 2, 'OCCUPIED',  'VIP Elite Stage', '192.168.20.101', 'Private Acoustic Booth Alpha'),
(8,  'VIP-02', 2, 'AVAILABLE', 'VIP Elite Stage', '192.168.20.102', 'Private Acoustic Booth Beta'),
(9,  'VIP-03', 2, 'RESERVED',  'VIP Elite Stage', '192.168.20.103', 'Tournament Streaming Rig'),
(10, 'VIP-04', 2, 'AVAILABLE', 'VIP Elite Stage', '192.168.20.104', 'Creator Lounge Suite'),

-- Console Bay (PS5-01 to PS5-04)
(11, 'PS5-01', 3, 'AVAILABLE', 'Console Bay', '192.168.30.101', 'Leather Double Recliner 1'),
(12, 'PS5-02', 3, 'OCCUPIED',  'Console Bay', '192.168.30.102', 'Leather Double Recliner 2'),
(13, 'PS5-03', 3, 'AVAILABLE', 'Console Bay', '192.168.30.103', 'Party Couch Pod 3'),
(14, 'PS5-04', 3, 'AVAILABLE', 'Console Bay', '192.168.30.104', 'Party Couch Pod 4'),

-- Sim Racing Pit (SIM-01 to SIM-02)
(15, 'SIM-01', 4, 'OCCUPIED',  'Sim Racing Pit', '192.168.40.101', 'F1 Cockpit Rig 1'),
(16, 'SIM-02', 4, 'AVAILABLE', 'Sim Racing Pit', '192.168.40.102', 'GT Racing Rig 2');

-- -----------------------------------------------------------------------------
-- 6. Installed Esports Games Catalog
-- -----------------------------------------------------------------------------
INSERT INTO games_catalog (game_id, title, genre, cover_image_url, supported_platforms, is_installed) VALUES
(1,  'Valorant',              'Tactical FPS',    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', 'PC', TRUE),
(2,  'Counter-Strike 2',      'Tactical FPS',    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300', 'PC', TRUE),
(3,  'League of Legends',     'MOBA',            'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300', 'PC', TRUE),
(4,  'Apex Legends',          'Battle Royale',   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300', 'PC / PS5', TRUE),
(5,  'EA SPORTS FC 25',       'Sports Simulation','https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300', 'PC / PS5', TRUE),
(6,  'Tekken 8',              'Fighting',        'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=300', 'PC / PS5', TRUE),
(7,  'Forza Motorsport 8',    'Sim Racing',      'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=300', 'PC / Sim Rig', TRUE),
(8,  'Cyberpunk 2077: Phantom Liberty', 'Action RPG', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=300', 'PC Elite', TRUE),
(9,  'Overwatch 2',           'Hero Shooter',    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300', 'PC', TRUE),
(10, 'Rocket League',         'Sports Arcade',   'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=300', 'PC / PS5', TRUE),
(11, 'Assetto Corsa Competizione', 'Sim Racing', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300', 'Sim Rig', TRUE),
(12, 'Call of Duty: Warzone', 'Battle Royale',   'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=300', 'PC / PS5', TRUE);

-- -----------------------------------------------------------------------------
-- 7. Café & Beverage Bar Menu
-- -----------------------------------------------------------------------------
INSERT INTO cafe_categories (cafe_cat_id, name, display_order, description) VALUES
(1, 'Energy & Craft Sodas', 1, 'Chilled esports fuel, specialty sparkling sodas, and zero-sugar energy cans.'),
(2, 'Artisan Coffee & Tea', 2, 'Locally roasted beans, double espresso shots, iced matchas, and cold brews.'),
(3, 'Hot Gamer Bites',      3, 'Mess-free hot finger snacks, loaded tenders, truffle fries, and sliders.'),
(4, 'Lounge Dessert & Sweets', 4, 'Warm baked treats, churros, and artisanal ice cream bowls.');

INSERT INTO cafe_items (item_id, cafe_cat_id, name, description, price, cost_price, stock_quantity, is_available, image_url) VALUES
(1, 1, 'Monster Ultra Peachy Keen', 'Zero-sugar crisp peach flavor with 160mg clean caffeine.', 4.50, 1.80, 48, TRUE, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300'),
(2, 1, 'Red Bull Dragon Fruit Summer Edition', 'Tropical dragon fruit infusion with revitalizing taurine.', 4.75, 1.95, 36, TRUE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300'),
(3, 1, 'Vortex Cyber Blue Mocktail', 'Blue curacao syrup, sparkling citrus soda, fresh mint, and popping boba.', 6.50, 2.10, 50, TRUE, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300'),
(4, 1, 'San Pellegrino Blood Orange', 'Natural Italian sparkling mineral water with Mediterranean citrus.', 3.75, 1.40, 60, TRUE, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300'),

(5, 2, 'Vortex Nitro Cold Brew', 'Steeped for 20 hours, infused with nitrogen for a creamy velvet finish.', 5.50, 1.50, 40, TRUE, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300'),
(6, 2, 'Double Shot Espresso Romano', 'Single-origin Ethiopian beans with a caramelized twist of lemon peel.', 4.00, 1.10, 80, TRUE, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300'),
(7, 2, 'Iced Ceremonial Matcha Latte', 'Uji Kyoto organic matcha layered over creamy oat milk and vanilla syrup.', 6.00, 2.20, 32, TRUE, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300'),

(8,  3, 'Truffle Parmesan Hand-Cut Fries', 'Crispy russet fries tossed in white truffle oil, shaved aged parmesan, and garlic aioli.', 8.50, 2.80, 45, TRUE, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300'),
(9,  3, 'Glazed Korean BBQ Chicken Tenders', 'Crispy buttermilk tenders glazed in sweet spicy gochujang and toasted sesame.', 11.50, 4.20, 30, TRUE, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300'),
(10, 3, 'Smash Wagyu Cheeseburger Sliders', 'Twin slider patties, melted sharp cheddar, caramelized onions, vortex secret sauce.', 13.50, 5.10, 25, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'),
(11, 3, 'Loaded Jalapeño Queso Nachos', 'Warm tortilla crisps, melted four-cheese queso, pickled jalapeños, and guacamole.', 9.50, 3.40, 28, TRUE, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300'),

(12, 4, 'Warm Molten Chocolate Lava Cookie', 'Freshly baked skillet cookie with Belgian molten core and vanilla bean gelato.', 7.50, 2.30, 22, TRUE, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300'),
(13, 4, 'Cinnamon Sugar Spanish Churros', 'Golden fried churros dusted in Saigon cinnamon with dark chocolate dip.', 6.50, 1.90, 35, TRUE, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300');

-- -----------------------------------------------------------------------------
-- 8. Bookings & Gaming Sessions (Historical & Live Active)
-- -----------------------------------------------------------------------------
-- Advance Reservations
INSERT INTO bookings (booking_id, user_id, station_id, start_time, end_time, status, deposit_amount) VALUES
(1, 5, 7,  NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 2 HOUR, 'CHECKED_IN', 20.00),
(2, 6, 1,  NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 1 HOUR, 'CHECKED_IN', 10.00),
(3, 7, 15, NOW() - INTERVAL 45 MINUTE, NOW() + INTERVAL 2 HOUR, 'CHECKED_IN', 25.00),
(4, 8, 12, NOW() - INTERVAL 30 MINUTE, NOW() + INTERVAL 90 MINUTE, 'CHECKED_IN', 15.00),
(5, 9, 9,  NOW() + INTERVAL 3 HOUR, NOW() + INTERVAL 5 HOUR, 'CONFIRMED', 15.00);

-- Gaming Sessions (Some completed in past days, 4 currently active)
INSERT INTO gaming_sessions (session_id, booking_id, user_id, station_id, staff_checkin_id, start_time, end_time, duration_minutes, hourly_rate_applied, subtotal_amount, discount_amount, total_amount, status, payment_status, created_at) VALUES
-- Past completed sessions
(101, NULL, 5, 7, 2, NOW() - INTERVAL 2 DAY - INTERVAL 3 HOUR, NOW() - INTERVAL 2 DAY, 180, 12.00, 36.00, 9.00, 27.00, 'COMPLETED', 'PAID_WALLET', NOW() - INTERVAL 2 DAY),
(102, NULL, 6, 1, 2, NOW() - INTERVAL 2 DAY - INTERVAL 2 HOUR, NOW() - INTERVAL 2 DAY, 120, 8.00, 16.00, 2.40, 13.60, 'COMPLETED', 'PAID_CARD', NOW() - INTERVAL 2 DAY),
(103, NULL, 7, 15, 3, NOW() - INTERVAL 1 DAY - INTERVAL 2 HOUR, NOW() - INTERVAL 1 DAY, 120, 18.00, 36.00, 5.40, 30.60, 'COMPLETED', 'PAID_WALLET', NOW() - INTERVAL 1 DAY),
(104, NULL, 8, 11, 4, NOW() - INTERVAL 1 DAY - INTERVAL 90 MINUTE, NOW() - INTERVAL 1 DAY, 90, 7.50, 11.25, 0.56, 10.69, 'COMPLETED', 'PAID_CARD', NOW() - INTERVAL 1 DAY),

-- Current LIVE ACTIVE sessions (Notice station_id matches stations marked OCCUPIED above!)
(201, 1, 5, 7, 2, NOW() - INTERVAL 112 MINUTE, NULL, 0, 12.00, 0.00, 0.00, 0.00, 'ACTIVE', 'PENDING', NOW() - INTERVAL 112 MINUTE),
(202, 2, 6, 1, 2, NOW() - INTERVAL 58 MINUTE,  NULL, 0,  8.00, 0.00, 0.00, 0.00, 'ACTIVE', 'PENDING', NOW() - INTERVAL 58 MINUTE),
(203, 3, 7, 15, 3, NOW() - INTERVAL 42 MINUTE, NULL, 0, 18.00, 0.00, 0.00, 0.00, 'ACTIVE', 'PENDING', NOW() - INTERVAL 42 MINUTE),
(204, 4, 8, 12, 4, NOW() - INTERVAL 25 MINUTE, NULL, 0,  7.50, 0.00, 0.00, 0.00, 'ACTIVE', 'PENDING', NOW() - INTERVAL 25 MINUTE);

-- Invoices for historical sessions
INSERT INTO invoices (invoice_id, invoice_number, user_id, session_id, subtotal, tax_amount, discount_amount, grand_total, payment_status, issued_at) VALUES
(1, 'INV-2026-000101', 5, 101, 36.00, 0.00, 9.00, 27.00, 'PAID', NOW() - INTERVAL 2 DAY),
(2, 'INV-2026-000102', 6, 102, 16.00, 0.00, 2.40, 13.60, 'PAID', NOW() - INTERVAL 2 DAY),
(3, 'INV-2026-000103', 7, 103, 36.00, 0.00, 5.40, 30.60, 'PAID', NOW() - INTERVAL 1 DAY),
(4, 'INV-2026-000104', 8, 104, 11.25, 0.00, 0.56, 10.69, 'PAID', NOW() - INTERVAL 1 DAY);

INSERT INTO payments (payment_id, invoice_id, amount, payment_method, payment_reference, paid_at) VALUES
(1, 1, 27.00, 'WALLET', 'PAY-WLT-9901', NOW() - INTERVAL 2 DAY),
(2, 2, 13.60, 'CREDIT_CARD', 'PAY-CC-9902', NOW() - INTERVAL 2 DAY),
(3, 3, 30.60, 'WALLET', 'PAY-WLT-9903', NOW() - INTERVAL 1 DAY),
(4, 4, 10.69, 'CREDIT_CARD', 'PAY-CC-9904', NOW() - INTERVAL 1 DAY);

-- -----------------------------------------------------------------------------
-- 9. Café Orders (Past served + Current live queue)
-- -----------------------------------------------------------------------------
INSERT INTO cafe_orders (order_id, user_id, session_id, station_id, order_status, payment_status, payment_method, total_amount, delivery_note, created_at) VALUES
-- Past served orders
(101, 5, 101, 7,  'SERVED', 'PAID', 'WALLET', 12.00, 'Deliver to VIP Booth Alpha', NOW() - INTERVAL 2 DAY),
(102, 6, 102, 1,  'SERVED', 'PAID', 'WALLET',  8.50, 'Station PC-01', NOW() - INTERVAL 2 DAY),

-- Live queue orders (Preparing & Placed)
(201, 5, 201, 7,  'PREPARING', 'PAID', 'WALLET', 18.00, 'Station VIP-01: Extra spicy dip for tenders', NOW() - INTERVAL 15 MINUTE),
(202, 6, 202, 1,  'PLACED',    'PAID', 'WALLET',  9.50, 'Station PC-01: Cold drink right away please', NOW() - INTERVAL 5 MINUTE),
(203, 7, 203, 15, 'SERVED',    'PAID', 'WALLET',  5.50, 'Station SIM-01: Nitro cold brew', NOW() - INTERVAL 28 MINUTE);

INSERT INTO cafe_order_items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(1, 101, 1, 1, 4.50, 4.50),
(2, 101, 12, 1, 7.50, 7.50),
(3, 102, 8, 1, 8.50, 8.50),
(4, 201, 9, 1, 11.50, 11.50),
(5, 201, 3, 1, 6.50, 6.50),
(6, 202, 11, 1, 9.50, 9.50),
(7, 203, 5, 1, 5.50, 5.50);

-- -----------------------------------------------------------------------------
-- 10. Staff Shifts, Attendance Logs, Leaves & Payroll
-- -----------------------------------------------------------------------------
INSERT INTO staff_shifts (shift_id, staff_id, scheduled_start, scheduled_end, actual_start, actual_end, late_minutes, status, notes) VALUES
-- Past week completed shifts
(1, 2, NOW() - INTERVAL 4 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 4 DAY, 0, 'COMPLETED', 'Opening shift clean'),
(2, 3, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY + INTERVAL 8 HOUR, NOW() - INTERVAL 4 DAY + INTERVAL 10 MINUTE, NOW() - INTERVAL 4 DAY + INTERVAL 8 HOUR, 10, 'COMPLETED', 'Replaced SSD on PC-05'),
(3, 4, NOW() - INTERVAL 3 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 3 DAY, 0, 'COMPLETED', 'High café order volume'),
(4, 2, NOW() - INTERVAL 2 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 2 DAY, 0, 'COMPLETED', 'Handled VIP tournament check-ins'),
(5, 3, NOW() - INTERVAL 1 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY - INTERVAL 8 HOUR, NOW() - INTERVAL 1 DAY, 0, 'COMPLETED', 'Network switch firmware update'),

-- Current active shift
(6, 2, NOW() - INTERVAL 3 HOUR, NOW() + INTERVAL 5 HOUR, NOW() - INTERVAL 3 HOUR, NULL, 0, 'ON_DUTY', 'Floor supervisor on duty'),
(7, 4, NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 9 HOUR, NULL, NULL, 0, 'SCHEDULED', 'Evening guest host shift');

INSERT INTO staff_leaves (leave_id, staff_id, leave_type, start_date, end_date, reason, status, approved_by, decision_at) VALUES
(1, 3, 'VACATION', '2026-12-24', '2026-12-28', 'Family holiday trip', 'APPROVED', 1, NOW() - INTERVAL 5 DAY),
(2, 4, 'PERSONAL', '2026-12-05', '2026-12-06', 'University graduation ceremony', 'PENDING', NULL, NULL);

INSERT INTO staff_payroll (payroll_id, staff_id, pay_period_start, pay_period_end, regular_hours, overtime_hours, hourly_rate, base_pay, overtime_pay, bonus, deductions, net_pay, payment_status, disbursed_at) VALUES
(1, 2, '2026-11-01', '2026-11-15', 80.00, 6.50, 26.50, 2120.00, 258.38, 150.00, 0.00, 2528.38, 'DISBURSED', '2026-11-16 10:00:00'),
(2, 3, '2026-11-01', '2026-11-15', 76.00, 0.00, 30.00, 2280.00, 0.00, 100.00, 0.00, 2380.00, 'DISBURSED', '2026-11-16 10:00:00'),
(3, 4, '2026-11-01', '2026-11-15', 68.00, 0.00, 21.00, 1428.00, 0.00, 50.00, 0.00, 1478.00, 'DISBURSED', '2026-11-16 10:00:00'),
(4, 2, '2026-11-16', '2026-11-30', 42.00, 2.00, 26.50, 1113.00, 79.50, 0.00, 0.00, 1192.50, 'APPROVED', NULL);
