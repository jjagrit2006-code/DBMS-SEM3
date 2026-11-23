const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isLiveDb = false;

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vortex_lounge',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = { rejectUnauthorized: false };
}

// In-Memory Fallback State (Realistic Indian Esports Lounge context & INR pricing)
const memoryState = {
  membership_tiers: [
    { tier_id: 1, tier_code: 'TIER_STD', name: 'Standard', hourly_discount_percent: 0, snack_discount_percent: 0, min_points_required: 0, monthly_fee: 0, perks_description: 'Access to all standard arena stations.', badge_color: '#64748b' },
    { tier_id: 2, tier_code: 'TIER_SLV', name: 'Silver Gamer', hourly_discount_percent: 5, snack_discount_percent: 5, min_points_required: 500, monthly_fee: 499, perks_description: '5% discount on all rigs, priority weekend queue.', badge_color: '#94a3b8' },
    { tier_id: 3, tier_code: 'TIER_GLD', name: 'Gold Pro', hourly_discount_percent: 15, snack_discount_percent: 10, min_points_required: 1500, monthly_fee: 1199, perks_description: '15% hourly discount, 10% snack discount, free beverage per visit.', badge_color: '#f59e0b' },
    { tier_id: 4, tier_code: 'TIER_VIP', name: 'Vortex VIP', hourly_discount_percent: 25, snack_discount_percent: 15, min_points_required: 3000, monthly_fee: 2499, perks_description: '25% hourly discount, 15% off café, unlimited sim racing access.', badge_color: '#22d3ee' }
  ],
  users: [
    { user_id: 1, username: 'vikram_ops', email: 'admin@vortexlounge.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'ADMIN', full_name: 'Vikram Malhotra', phone: '+91 98201 99001', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', is_active: 1 },
    { user_id: 2, username: 'ananya_floor', email: 'ananya@vortexlounge.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'STAFF', full_name: 'Ananya Nair', phone: '+91 98202 34002', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', is_active: 1 },
    { user_id: 3, username: 'kabir_tech', email: 'kabir@vortexlounge.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'STAFF', full_name: 'Kabir Mehta', phone: '+91 98203 34003', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', is_active: 1 },
    { user_id: 4, username: 'pooja_host', email: 'pooja@vortexlounge.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'STAFF', full_name: 'Pooja Roy', phone: '+91 98204 34004', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', is_active: 1 },
    { user_id: 5, username: 'aarav_sharma', email: 'aarav@vortexgamer.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'PLAYER', full_name: 'Aarav Sharma', phone: '+91 98111 44551', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', is_active: 1 },
    { user_id: 6, username: 'rohan_verma', email: 'rohan@vortexgamer.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'PLAYER', full_name: 'Rohan Verma', phone: '+91 98112 44552', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', is_active: 1 },
    { user_id: 7, username: 'dev_patel', email: 'dev@vortexgamer.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'PLAYER', full_name: 'Devansh Patel', phone: '+91 98113 44553', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', is_active: 1 },
    { user_id: 8, username: 'priya_sen', email: 'priya@vortexgamer.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'PLAYER', full_name: 'Priya Sen', phone: '+91 98114 44554', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', is_active: 1 },
    { user_id: 9, username: 'rithvik_n', email: 'rithvik@vortexgamer.in', password_hash: '$2b$10$wE7/L5QZp0vU4n8A4c9l8uM4s4v6a5c6d7e8f9g0h1i2j3k4l5m', role: 'PLAYER', full_name: 'Rithvik Nair', phone: '+91 98115 44555', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', is_active: 1 }
  ],
  player_profiles: [
    { player_id: 5, tier_id: 4, loyalty_points: 3850, total_play_minutes: 4820, preferred_zone: 'VIP Elite Stage' },
    { player_id: 6, tier_id: 3, loyalty_points: 1920, total_play_minutes: 2450, preferred_zone: 'Pro Arena' },
    { player_id: 7, tier_id: 3, loyalty_points: 1640, total_play_minutes: 1980, preferred_zone: 'Sim Racing Pit' },
    { player_id: 8, tier_id: 2, loyalty_points: 750, total_play_minutes: 1120, preferred_zone: 'Console Bay' },
    { player_id: 9, tier_id: 1, loyalty_points: 120, total_play_minutes: 280, preferred_zone: 'Pro Arena' }
  ],
  player_wallets: [
    { wallet_id: 1, user_id: 5, balance: 2450.00, currency: 'INR' },
    { wallet_id: 2, user_id: 6, balance: 1200.00, currency: 'INR' },
    { wallet_id: 3, user_id: 7, balance: 850.00, currency: 'INR' },
    { wallet_id: 4, user_id: 8, balance: 450.00, currency: 'INR' },
    { wallet_id: 5, user_id: 9, balance: 250.00, currency: 'INR' }
  ],
  wallet_transactions: [
    { transaction_id: 1, wallet_id: 1, amount: 2000.00, transaction_type: 'TOPUP', reference_id: 'UPI-908182', description: 'Digital wallet credit top-up via UPI', balance_after: 2000.00, created_at: new Date(Date.now() - 432000000).toISOString() },
    { transaction_id: 2, wallet_id: 1, amount: 1000.00, transaction_type: 'TOPUP', reference_id: 'UPI-909912', description: 'Digital wallet credit top-up via UPI', balance_after: 3000.00, created_at: new Date(Date.now() - 86400000).toISOString() },
    { transaction_id: 3, wallet_id: 1, amount: -550.00, transaction_type: 'CAFE_PURCHASE', reference_id: 'ORD-101', description: 'Café snack: Nitro Cold Brew & Truffle Fries', balance_after: 2450.00, created_at: new Date(Date.now() - 86400000).toISOString() },
    { transaction_id: 4, wallet_id: 2, amount: 1000.00, transaction_type: 'TOPUP', reference_id: 'UPI-908521', description: 'Digital wallet credit top-up via UPI', balance_after: 1000.00, created_at: new Date(Date.now() - 259200000).toISOString() },
    { transaction_id: 5, wallet_id: 2, amount: 500.00, transaction_type: 'TOPUP', reference_id: 'UPI-910243', description: 'Digital wallet credit top-up via UPI', balance_after: 1500.00, created_at: new Date(Date.now() - 259200000).toISOString() },
    { transaction_id: 6, wallet_id: 2, amount: -300.00, transaction_type: 'SESSION_DEDUCTION', reference_id: 'SESS-201', description: 'Pro Arena gaming session (120 mins)', balance_after: 1200.00, created_at: new Date(Date.now() - 172800000).toISOString() }
  ],
  station_categories: [
    {
      category_id: 1,
      category_code: 'PC_PRO',
      name: 'Esports Pro Arena',
      base_hourly_rate: 180.00,
      description: 'High-FPS tournament tier rigs tuned for competitive shooters and MOBAs.',
      display_badge: '240Hz OLED',
      image_url: 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-3f7a97d6442c4dd8bab8544872738fc0',
      specs_json: { gpu: 'RTX 4080 Super 16GB', cpu: 'Core i7-14700K 20-Core', ram: '32GB DDR5-6000', monitor: '27" ROG 240Hz OLED 0.03ms', peripherals: 'Wooting 60HE + Logitech Superlight 2' }
    },
    {
      category_id: 2,
      category_code: 'PC_ELITE',
      name: 'VIP Elite Liquid Pod',
      base_hourly_rate: 280.00,
      description: 'Custom open-loop liquid-cooled rigs in private acoustic pods with 360Hz displays.',
      display_badge: '360Hz Liquid',
      image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg',
      specs_json: { gpu: 'RTX 4090 OC 24GB', cpu: 'Ryzen 7 7800X3D 8-Core', ram: '64GB DDR5-6400', monitor: '34" Alienware 360Hz QD-OLED Curved', peripherals: 'Custom Keeb + Razer Viper Mini SE' }
    },
    {
      category_id: 3,
      category_code: 'CONSOLE_PS5',
      name: 'Console Lounge Bay',
      base_hourly_rate: 150.00,
      description: 'Private recliners with PlayStation 5 Pro & 4K 120Hz OLED displays.',
      display_badge: '4K 120Hz OLED',
      image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg',
      specs_json: { console: 'PlayStation 5 Pro 2TB', display: '55" LG C4 4K 120Hz OLED HDR', audio: 'SteelSeries Arctis Nova Pro Wireless', controllers: 'DualSense Edge Controllers' }
    },
    {
      category_id: 4,
      category_code: 'SIM_RACING',
      name: 'Sim Racing Motion Pit',
      base_hourly_rate: 350.00,
      description: 'Direct-drive force feedback cockpits with hydraulic load-cell pedals and triple wrap screens.',
      display_badge: 'Direct Drive Sim',
      image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2488620/capsule_616x353.jpg',
      specs_json: { wheelbase: 'Fanatec ClubSport DD+ 15Nm Direct Drive', cockpit: 'Next Level Racing GTTrack with Motion Platform V3', pedals: 'Heusinkveld Sprint Load Cell', displays: 'Triple 32" 1440p 165Hz Curved' }
    }
  ],
  gaming_stations: [
    { station_id: 1, station_code: 'PC-01', station_name: 'VALORANT Battle Rig', category_id: 1, status: 'OCCUPIED', location_zone: 'Pro Arena', mac_ip_address: '192.168.10.101', notes: 'Row A - Center Stage', featured_game: 'VALORANT', image_url: 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-3f7a97d6442c4dd8bab8544872738fc0' },
    { station_id: 2, station_code: 'PC-02', station_name: 'Counter-Strike 2 Arena', category_id: 1, status: 'AVAILABLE', location_zone: 'Pro Arena', mac_ip_address: '192.168.10.102', notes: 'Row A - Right Wing', featured_game: 'Counter-Strike 2', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg' },
    { station_id: 3, station_code: 'PC-03', station_name: 'Apex Legends Rig', category_id: 1, status: 'AVAILABLE', location_zone: 'Pro Arena', mac_ip_address: '192.168.10.103', notes: 'Row B - Left Wing', featured_game: 'Apex Legends', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg' },
    { station_id: 4, station_code: 'PC-04', station_name: 'PUBG Battle Rig', category_id: 1, status: 'OCCUPIED', location_zone: 'Pro Arena', mac_ip_address: '192.168.10.104', notes: 'Row B - Center Stage', featured_game: 'PUBG', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_616x353.jpg' },
    { station_id: 5, station_code: 'PC-05', station_name: 'Call of Duty: Warzone Rig', category_id: 1, status: 'MAINTENANCE', location_zone: 'Pro Arena', mac_ip_address: '192.168.10.105', notes: 'DisplayPort cable swap scheduled', featured_game: 'Call of Duty', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/capsule_616x353.jpg' },
    { station_id: 6, station_code: 'PC-06', station_name: 'Fortnite Battle Rig', category_id: 1, status: 'AVAILABLE', location_zone: 'Pro Arena', mac_ip_address: '192.168.10.106', notes: 'Row C - Soundproof Booth', featured_game: 'Fortnite', image_url: 'https://cdn1.epicgames.com/offer/fn/Blade_2560x1440_2560x1440-ae5060b66a50678ab728ab99ee1743a6' },
    { station_id: 7, station_code: 'VIP-01', station_name: 'Cyberpunk 2077 VIP Pod', category_id: 2, status: 'OCCUPIED', location_zone: 'VIP Elite Stage', mac_ip_address: '192.168.20.101', notes: 'Private Acoustic Booth Alpha', featured_game: 'Cyberpunk 2077', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg' },
    { station_id: 8, station_code: 'VIP-02', station_name: 'Grand Theft Auto V Suite', category_id: 2, status: 'AVAILABLE', location_zone: 'VIP Elite Stage', mac_ip_address: '192.168.20.102', notes: 'Private Acoustic Booth Beta', featured_game: 'GTA V', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/capsule_616x353.jpg' },
    { station_id: 9, station_code: 'VIP-03', station_name: 'Minecraft RTX Studio', category_id: 2, status: 'RESERVED', location_zone: 'VIP Elite Stage', mac_ip_address: '192.168.20.103', notes: 'Tournament Streaming Rig', featured_game: 'Minecraft RTX', image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Minecraft_Key-art.png' },
    { station_id: 10, station_code: 'VIP-04', station_name: 'Rocket League VIP Pod', category_id: 2, status: 'AVAILABLE', location_zone: 'VIP Elite Stage', mac_ip_address: '192.168.20.104', notes: 'Creator Lounge Suite', featured_game: 'Rocket League', image_url: 'https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef049cb812/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-a1f9a03975a40a2a4b8686e00155b4fe' },
    { station_id: 11, station_code: 'PS5-01', station_name: 'EA SPORTS FC 25 Lounge', category_id: 3, status: 'AVAILABLE', location_zone: 'Console Bay', mac_ip_address: '192.168.30.101', notes: 'Leather Double Recliner 1', featured_game: 'EA SPORTS FC 25', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg' },
    { station_id: 12, station_code: 'PS5-02', station_name: 'TEKKEN 8 Fight Bay', category_id: 3, status: 'OCCUPIED', location_zone: 'Console Bay', mac_ip_address: '192.168.30.102', notes: 'Leather Double Recliner 2', featured_game: 'TEKKEN 8', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/capsule_616x353.jpg' },
    { station_id: 13, station_code: 'PS5-03', station_name: 'Free Fire MAX Battle Bay', category_id: 3, status: 'AVAILABLE', location_zone: 'Console Bay', mac_ip_address: '192.168.30.103', notes: 'Party Couch Pod 3', featured_game: 'Free Fire MAX', image_url: 'https://images.wallpapersden.com/image/download/garena-free-fire-cyborgs_bGpna2WUmZqaraWkpJRobWllrWdma2U.jpg' },
    { station_id: 14, station_code: 'PS5-04', station_name: 'Street Fighter 6 Arena', category_id: 3, status: 'AVAILABLE', location_zone: 'Console Bay', mac_ip_address: '192.168.30.104', notes: 'Party Couch Pod 4', featured_game: 'Street Fighter 6', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg' },
    { station_id: 15, station_code: 'SIM-01', station_name: 'F1 24 Motion Cockpit', category_id: 4, status: 'OCCUPIED', location_zone: 'Sim Racing Pit', mac_ip_address: '192.168.40.101', notes: 'F1 Cockpit Rig 1', featured_game: 'F1 24', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2488620/capsule_616x353.jpg' },
    { station_id: 16, station_code: 'SIM-02', station_name: 'Forza Horizon 5 Motion Pit', category_id: 4, status: 'AVAILABLE', location_zone: 'Sim Racing Pit', mac_ip_address: '192.168.40.102', notes: 'GT Racing Rig 2', featured_game: 'Forza Horizon 5', image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/capsule_616x353.jpg' }
  ],
  games_catalog: [
    { 
      game_id: 1, 
      title: 'VALORANT', 
      genre: 'Tactical FPS', 
      cover_image_url: 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-3f7a97d6442c4dd8bab8544872738fc0', 
      supported_platforms: 'PC 240Hz OLED', 
      optimal_zone: 'Pro Arena',
      framerate_target: '240+ FPS',
      player_count: '5v5 Competitive',
      description: 'Precise 5v5 character-based tactical shooter from Riot Games combining lethal gunplay with unique agent abilities.',
      is_installed: 1 
    },
    { 
      game_id: 2, 
      title: 'Counter-Strike 2', 
      genre: 'Tactical FPS', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg', 
      supported_platforms: 'PC 360Hz Liquid', 
      optimal_zone: 'VIP Elite Stage',
      framerate_target: '360+ FPS',
      player_count: '5v5 Competitive',
      description: 'The pinnacle of tactical FPS esports, running at 360Hz sub-tick precision with zero display latency on RTX 4090.',
      is_installed: 1 
    },
    { 
      game_id: 3, 
      title: 'Grand Theft Auto V', 
      genre: 'Open World Action', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/capsule_616x353.jpg', 
      supported_platforms: 'PC / VIP Elite Stage', 
      optimal_zone: 'VIP Elite Stage',
      framerate_target: '165+ FPS 4K',
      player_count: 'GTA Online / FiveM RP',
      description: 'Los Santos open-world epic and FiveM custom roleplay servers loaded with graphics overhauls and racing wheels.',
      is_installed: 1 
    },
    { 
      game_id: 4, 
      title: 'EA SPORTS FC 25', 
      genre: 'Sports Simulation', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg', 
      supported_platforms: 'PS5 Pro Bay', 
      optimal_zone: 'Console Bay',
      framerate_target: '4K 120Hz HDR',
      player_count: '1v1 / 2v2 Versus',
      description: 'Next-gen football simulation powered by HyperMotionV on 55" OLED displays with DualSense Edge controllers.',
      is_installed: 1 
    },
    { 
      game_id: 5, 
      title: 'Forza Horizon 5', 
      genre: 'Sim Racing', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/capsule_616x353.jpg', 
      supported_platforms: 'Fanatec DD Sim', 
      optimal_zone: 'Sim Racing Pit',
      framerate_target: 'Triple 1440p 165Hz',
      player_count: 'Open World Racing',
      description: 'Explore the vibrant landscapes of Mexico with deep force-feedback on our 15Nm direct-drive racing cockpits.',
      is_installed: 1 
    },
    { 
      game_id: 6, 
      title: 'Call of Duty: Warzone', 
      genre: 'Battle Royale', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/capsule_616x353.jpg', 
      supported_platforms: 'PC / PS5 Pro', 
      optimal_zone: 'Pro Arena',
      framerate_target: '240 FPS',
      player_count: 'Squads Battle Royale',
      description: 'Massive combat arena battle royale with tight gun mechanics, gulag 1v1 duels, and custom tournament lobbies.',
      is_installed: 1 
    },
    { 
      game_id: 7, 
      title: 'Apex Legends', 
      genre: 'Battle Royale', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg', 
      supported_platforms: 'PC / PS5 Pro', 
      optimal_zone: 'Pro Arena',
      framerate_target: '165+ FPS',
      player_count: '60-Player Trios',
      description: 'High-octane hero battle royale with fluid movement mechanics, squad abilities, and official tournament client.',
      is_installed: 1 
    },
    { 
      game_id: 8, 
      title: 'Fortnite', 
      genre: 'Battle Royale & Creative', 
      cover_image_url: 'https://cdn1.epicgames.com/offer/fn/Blade_2560x1440_2560x1440-ae5060b66a50678ab728ab99ee1743a6', 
      supported_platforms: 'PC 240Hz / PS5 Pro', 
      optimal_zone: 'Pro Arena',
      framerate_target: '240+ FPS',
      player_count: '100-Player Battle Royale',
      description: 'Unreal Engine 5 battle royale featuring fast-paced builds, Zero Build mode, and official tournament lobbies.',
      is_installed: 1 
    },
    { 
      game_id: 9, 
      title: 'Rocket League', 
      genre: 'Sports Arcade', 
      cover_image_url: 'https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef049cb812/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-a1f9a03975a40a2a4b8686e00155b4fe', 
      supported_platforms: 'PC / PS5 Pro', 
      optimal_zone: 'Console Bay',
      framerate_target: '240 FPS',
      player_count: '3v3 Aerial Soccar',
      description: 'High-flying vehicular soccer with acrobatic rocket-boosted physics and instant local multiplayer matchmaking.',
      is_installed: 1 
    },
    { 
      game_id: 10, 
      title: 'F1 24', 
      genre: 'Sim Racing', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2488620/capsule_616x353.jpg', 
      supported_platforms: 'Fanatec DD Sim', 
      optimal_zone: 'Sim Racing Pit',
      framerate_target: 'Triple 1440p 165Hz',
      player_count: 'Official Formula 1 Sim',
      description: 'Official 2024 FIA Formula One World Championship video game featuring Dynamic Handling tuned for direct-drive wheelbases.',
      is_installed: 1 
    },
    { 
      game_id: 11, 
      title: 'PUBG: BATTLEGROUNDS', 
      genre: 'Battle Royale', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_616x353.jpg', 
      supported_platforms: 'PC 240Hz OLED', 
      optimal_zone: 'Pro Arena',
      framerate_target: '200+ FPS',
      player_count: '100-Player Tactical BR',
      description: 'The classic tactical battle royale with realistic ballistics, weapon recoil mastery, and custom tournament rooms.',
      is_installed: 1 
    },
    { 
      game_id: 12, 
      title: 'Minecraft', 
      genre: 'Sandbox & Survival', 
      cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Minecraft_Key-art.png', 
      supported_platforms: 'PC 240Hz / RTX Shaders', 
      optimal_zone: 'VIP Elite Stage',
      framerate_target: '240+ FPS Ray Tracing',
      player_count: 'Multiplayer / Hypixel',
      description: 'The world’s best-selling sandbox running with Complementary Reimagined RTX Shaders, low-ping Hypixel routing, and LAN worlds.',
      is_installed: 1 
    },
    { 
      game_id: 13, 
      title: 'Garena Free Fire MAX', 
      genre: 'Battle Royale', 
      cover_image_url: 'https://images.wallpapersden.com/image/download/garena-free-fire-cyborgs_bGpna2WUmZqaraWkpJRobWllrWdma2U.jpg', 
      supported_platforms: 'PC BlueStacks 240Hz / Mobile Bay', 
      optimal_zone: 'Pro Arena',
      framerate_target: '120+ FPS',
      player_count: '50-Player Lobby',
      description: 'Ultra-fast battle royale tuned with dedicated keybind emulation, 120 FPS high refresh mode, and squad voice chat.',
      is_installed: 1 
    },
    { 
      game_id: 14, 
      title: 'Tekken 8', 
      genre: 'Fighting Arena', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/capsule_616x353.jpg', 
      supported_platforms: 'PS5 Pro Bay', 
      optimal_zone: 'Console Bay', 
      framerate_target: '60 FPS 1ms', 
      player_count: '1v1 Local Versus',
      description: 'Aggressive 3D fighting engine with destructible stages, Heat System mechanics, and tournament arcade stick support.',
      is_installed: 1 
    },
    { 
      game_id: 15, 
      title: 'Cyberpunk 2077: Phantom Liberty', 
      genre: 'Action RPG', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg', 
      supported_platforms: 'RTX 4090 VIP', 
      optimal_zone: 'VIP Elite Stage', 
      framerate_target: '360Hz Path Tracing', 
      player_count: 'Single Player Epic', 
      description: 'Visual spectacle running at max settings with full path tracing and DLSS 3.5 on our RTX 4090 liquid-cooled rigs.',
      is_installed: 1 
    },
    { 
      game_id: 16, 
      title: 'Assetto Corsa Competizione', 
      genre: 'Sim Racing', 
      cover_image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/805550/capsule_616x353.jpg', 
      supported_platforms: 'Fanatec DD Sim', 
      optimal_zone: 'Sim Racing Pit', 
      framerate_target: 'Triple 1440p 165Hz', 
      player_count: 'Official GT3 Sim', 
      description: 'The official GT World Challenge sim. Authentic tyre wear, hydraulic load-cell braking, and laser-scanned tracks.',
      is_installed: 1 
    }
  ],
  bookings: [
    { booking_id: 1, user_id: 5, station_id: 7, start_time: new Date(Date.now() - 7200000).toISOString(), end_time: new Date(Date.now() + 7200000).toISOString(), status: 'CHECKED_IN', deposit_amount: 300.00 },
    { booking_id: 2, user_id: 6, station_id: 1, start_time: new Date(Date.now() - 3600000).toISOString(), end_time: new Date(Date.now() + 3600000).toISOString(), status: 'CHECKED_IN', deposit_amount: 200.00 },
    { booking_id: 3, user_id: 7, station_id: 15, start_time: new Date(Date.now() - 2520000).toISOString(), end_time: new Date(Date.now() + 7200000).toISOString(), status: 'CHECKED_IN', deposit_amount: 500.00 },
    { booking_id: 4, user_id: 8, station_id: 12, start_time: new Date(Date.now() - 1500000).toISOString(), end_time: new Date(Date.now() + 5400000).toISOString(), status: 'CHECKED_IN', deposit_amount: 200.00 }
  ],
  gaming_sessions: [
    { session_id: 101, booking_id: null, user_id: 5, station_id: 7, staff_checkin_id: 2, start_time: new Date(Date.now() - 180000000).toISOString(), end_time: new Date(Date.now() - 172800000).toISOString(), duration_minutes: 120, hourly_rate_applied: 280.00, subtotal_amount: 560.00, discount_amount: 140.00, total_amount: 420.00, status: 'COMPLETED', payment_status: 'PAID_WALLET' },
    { session_id: 102, booking_id: null, user_id: 6, station_id: 1, staff_checkin_id: 2, start_time: new Date(Date.now() - 176400000).toISOString(), end_time: new Date(Date.now() - 172800000).toISOString(), duration_minutes: 120, hourly_rate_applied: 180.00, subtotal_amount: 360.00, discount_amount: 54.00, total_amount: 306.00, status: 'COMPLETED', payment_status: 'PAID_WALLET' },
    { session_id: 103, booking_id: null, user_id: 7, station_id: 15, staff_checkin_id: 3, start_time: new Date(Date.now() - 93600000).toISOString(), end_time: new Date(Date.now() - 86400000).toISOString(), duration_minutes: 90, hourly_rate_applied: 350.00, subtotal_amount: 525.00, discount_amount: 78.75, total_amount: 446.25, status: 'COMPLETED', payment_status: 'PAID_WALLET' },
    // Active sessions
    { session_id: 201, booking_id: 1, user_id: 5, station_id: 7, staff_checkin_id: 2, start_time: new Date(Date.now() - 4320000).toISOString(), end_time: null, duration_minutes: 72, hourly_rate_applied: 280.00, subtotal_amount: 336.00, discount_amount: 84.00, total_amount: 252.00, status: 'ACTIVE', payment_status: 'PENDING' },
    { session_id: 202, booking_id: 2, user_id: 6, station_id: 1, staff_checkin_id: 2, start_time: new Date(Date.now() - 3480000).toISOString(), end_time: null, duration_minutes: 58, hourly_rate_applied: 180.00, subtotal_amount: 174.00, discount_amount: 26.10, total_amount: 147.90, status: 'ACTIVE', payment_status: 'PENDING' },
    { session_id: 203, booking_id: 3, user_id: 7, station_id: 15, staff_checkin_id: 3, start_time: new Date(Date.now() - 2520000).toISOString(), end_time: null, duration_minutes: 42, hourly_rate_applied: 350.00, subtotal_amount: 245.00, discount_amount: 36.75, total_amount: 208.25, status: 'ACTIVE', payment_status: 'PENDING' },
    { session_id: 204, booking_id: 4, user_id: 8, station_id: 12, staff_checkin_id: 4, start_time: new Date(Date.now() - 1500000).toISOString(), end_time: null, duration_minutes: 25, hourly_rate_applied: 150.00, subtotal_amount: 62.50, discount_amount: 3.12, total_amount: 59.38, status: 'ACTIVE', payment_status: 'PENDING' }
  ],
  cafe_categories: [
    { cafe_cat_id: 1, name: 'Chilled Energy & Drinks', display_order: 1, description: 'Esports coolers, craft energy cans, and artisan sodas.' },
    { cafe_cat_id: 2, name: 'Artisan Coffee & Cold Brew', display_order: 2, description: 'Single-origin espresso, nitrogen cold brew, and matcha.' },
    { cafe_cat_id: 3, name: 'Hot Lounge Snacks & Bites', display_order: 3, description: 'Crispy finger foods, loaded tenders, truffle fries, and sliders.' },
    { cafe_cat_id: 4, name: 'Desserts & Sweet Fuel', display_order: 4, description: 'Warm baked cookies, churros, and dessert bowls.' }
  ],
  cafe_items: [
    { item_id: 1, cafe_cat_id: 1, name: 'Monster Ultra Peachy Keen', description: 'Zero-sugar crisp peach energy can with 160mg clean caffeine.', price: 160.00, cost_price: 90.00, stock_quantity: 48, is_available: 1, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
    { item_id: 2, cafe_cat_id: 1, name: 'Red Bull Energy Cooler', description: 'Chilled taurine reviver with crushed ice and citrus zest.', price: 175.00, cost_price: 95.00, stock_quantity: 36, is_available: 1, image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' },
    { item_id: 3, cafe_cat_id: 1, name: 'Vortex Electric Blue Mojito', description: 'Sparkling citrus soda, fresh mint, blue curacao syrup, popping boba.', price: 190.00, cost_price: 80.00, stock_quantity: 50, is_available: 1, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
    { item_id: 4, cafe_cat_id: 1, name: 'San Pellegrino Sparkling Blood Orange', description: 'Italian sparkling mineral water with Mediterranean citrus.', price: 140.00, cost_price: 70.00, stock_quantity: 60, is_available: 1, image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500' },
    { item_id: 5, cafe_cat_id: 2, name: 'Vortex Nitro Cold Brew', description: 'Steeped for 20 hours, nitrogen-charged for a rich velvet crema.', price: 210.00, cost_price: 75.00, stock_quantity: 40, is_available: 1, image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500' },
    { item_id: 6, cafe_cat_id: 2, name: 'Double Shot Espresso Romano', description: 'Single-origin roast with a caramelized twist of fresh lemon peel.', price: 150.00, cost_price: 50.00, stock_quantity: 80, is_available: 1, image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500' },
    { item_id: 7, cafe_cat_id: 2, name: 'Iced Ceremonial Matcha Latte', description: 'Uji Kyoto organic matcha layered over creamy oat milk.', price: 240.00, cost_price: 100.00, stock_quantity: 32, is_available: 1, image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500' },
    { item_id: 8, cafe_cat_id: 3, name: 'Truffle Parmesan Hand-Cut Fries', description: 'Russet fries tossed in white truffle oil, shaved parmesan, garlic dip.', price: 220.00, cost_price: 85.00, stock_quantity: 45, is_available: 1, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
    { item_id: 9, cafe_cat_id: 3, name: 'Crispy Korean BBQ Chicken Tenders', description: 'Crispy buttermilk tenders glazed in sweet spicy gochujang.', price: 310.00, cost_price: 130.00, stock_quantity: 30, is_available: 1, image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
    { item_id: 10, cafe_cat_id: 3, name: 'Twin Smash Cheeseburger Sliders', description: 'Crispy edge patties, melted sharp cheddar, caramelized onions.', price: 340.00, cost_price: 145.00, stock_quantity: 25, is_available: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
    { item_id: 11, cafe_cat_id: 3, name: 'Loaded Jalapeño Queso Nachos', description: 'Warm tortilla crisps, four-cheese queso, pickled jalapeños, salsa.', price: 260.00, cost_price: 95.00, stock_quantity: 28, is_available: 1, image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
    { item_id: 12, cafe_cat_id: 4, name: 'Molten Chocolate Skillet Cookie', description: 'Freshly baked cookie with dark chocolate core and vanilla bean gelato.', price: 240.00, cost_price: 90.00, stock_quantity: 22, is_available: 1, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500' },
    { item_id: 13, cafe_cat_id: 4, name: 'Cinnamon Spanish Churros', description: 'Golden fried churros dusted in Saigon cinnamon with dark dip.', price: 210.00, cost_price: 80.00, stock_quantity: 35, is_available: 1, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500' }
  ],
  cafe_orders: [
    { order_id: 101, user_id: 5, session_id: 101, station_id: 7, order_status: 'SERVED', payment_status: 'PAID', payment_method: 'WALLET', total_amount: 450.00, delivery_note: 'Deliver to VIP Booth Alpha', created_at: new Date(Date.now() - 172800000).toISOString(), items: [{ item_id: 5, name: 'Vortex Nitro Cold Brew', quantity: 1, unit_price: 210.00, subtotal: 210.00 }, { item_id: 12, name: 'Molten Chocolate Skillet Cookie', quantity: 1, unit_price: 240.00, subtotal: 240.00 }] },
    { order_id: 201, user_id: 5, session_id: 201, station_id: 7, order_status: 'PREPARING', payment_status: 'PAID', payment_method: 'WALLET', total_amount: 500.00, delivery_note: 'Station VIP-01: Extra spicy dip for tenders', created_at: new Date(Date.now() - 900000).toISOString(), items: [{ item_id: 9, name: 'Crispy Korean BBQ Chicken Tenders', quantity: 1, unit_price: 310.00, subtotal: 310.00 }, { item_id: 3, name: 'Vortex Electric Blue Mojito', quantity: 1, unit_price: 190.00, subtotal: 190.00 }] },
    { order_id: 202, user_id: 6, session_id: 202, station_id: 1, order_status: 'PLACED', payment_status: 'PAID', payment_method: 'WALLET', total_amount: 260.00, delivery_note: 'Station PC-01: Cold drink right away please', created_at: new Date(Date.now() - 300000).toISOString(), items: [{ item_id: 11, name: 'Loaded Jalapeño Queso Nachos', quantity: 1, unit_price: 260.00, subtotal: 260.00 }] }
  ],
  staff_profiles: [
    { staff_id: 2, job_title: 'Lounge Shift Lead', hourly_wage: 250.00, hire_date: '2024-03-15', emergency_contact: 'Suresh Nair (+91 98200 11223)', status: 'ACTIVE' },
    { staff_id: 3, job_title: 'Systems & Net Engineer', hourly_wage: 320.00, hire_date: '2024-01-10', emergency_contact: 'Sunil Mehta (+91 98200 33445)', status: 'ACTIVE' },
    { staff_id: 4, job_title: 'Guest Experience Host', hourly_wage: 200.00, hire_date: '2024-06-01', emergency_contact: 'Anil Roy (+91 98200 55667)', status: 'ACTIVE' }
  ],
  staff_shifts: [
    { shift_id: 1, staff_id: 2, scheduled_start: new Date(Date.now() - 374400000).toISOString(), scheduled_end: new Date(Date.now() - 345600000).toISOString(), actual_start: new Date(Date.now() - 374400000).toISOString(), actual_end: new Date(Date.now() - 345600000).toISOString(), late_minutes: 0, status: 'COMPLETED', notes: 'Opening shift inspection' },
    { shift_id: 2, staff_id: 3, scheduled_start: new Date(Date.now() - 345600000).toISOString(), scheduled_end: new Date(Date.now() - 316800000).toISOString(), actual_start: new Date(Date.now() - 345000000).toISOString(), actual_end: new Date(Date.now() - 316800000).toISOString(), late_minutes: 10, status: 'COMPLETED', notes: 'Replaced SSD on PC-05' },
    { shift_id: 6, staff_id: 2, scheduled_start: new Date(Date.now() - 10800000).toISOString(), scheduled_end: new Date(Date.now() + 18000000).toISOString(), actual_start: new Date(Date.now() - 10800000).toISOString(), actual_end: null, late_minutes: 0, status: 'ON_DUTY', notes: 'Floor supervisor on duty' }
  ],
  staff_leaves: [
    { leave_id: 1, staff_id: 3, leave_type: 'VACATION', start_date: '2026-12-24', end_date: '2026-12-28', reason: 'Family holiday trip', status: 'APPROVED', approved_by: 1, decision_at: new Date(Date.now() - 432000000).toISOString() },
    { leave_id: 2, staff_id: 4, leave_type: 'PERSONAL', start_date: '2026-12-05', end_date: '2026-12-06', reason: 'Family function', status: 'PENDING', approved_by: null, decision_at: null }
  ],
  staff_payroll: [
    { payroll_id: 1, staff_id: 2, pay_period_start: '2026-11-01', pay_period_end: '2026-11-15', regular_hours: 80.00, overtime_hours: 6.50, hourly_rate: 250.00, base_pay: 20000.00, overtime_pay: 2437.50, bonus: 1500.00, deductions: 0.00, net_pay: 23937.50, payment_status: 'DISBURSED' },
    { payroll_id: 2, staff_id: 3, pay_period_start: '2026-11-01', pay_period_end: '2026-11-15', regular_hours: 76.00, overtime_hours: 0.00, hourly_rate: 320.00, base_pay: 24320.00, overtime_pay: 0.00, bonus: 1000.00, deductions: 0.00, net_pay: 25320.00, payment_status: 'DISBURSED' },
    { payroll_id: 3, staff_id: 4, pay_period_start: '2026-11-01', pay_period_end: '2026-11-15', regular_hours: 68.00, overtime_hours: 0.00, hourly_rate: 200.00, base_pay: 13600.00, overtime_pay: 0.00, bonus: 500.00, deductions: 0.00, net_pay: 14100.00, payment_status: 'DISBURSED' }
  ]
};

// Initialize or test connection to MySQL
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    isLiveDb = true;
    console.log(`[DB] Connected successfully to live MySQL database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
  } catch (err) {
    isLiveDb = false;
    console.warn(`[DB] Live MySQL not reachable (${err.message}). Running in Standby Mode with in-memory seeded lounge state. All API endpoints and business logic remain fully functional!`);
  }
}

// Stored Procedure Simulator for In-Memory Mode
function executeSimulation(procName, args) {
  if (procName === 'sp_start_gaming_session') {
    const [userId, stationId, staffId] = args;
    const station = memoryState.gaming_stations.find(s => s.station_id === parseInt(stationId));
    if (!station || station.status !== 'AVAILABLE') {
      throw new Error('Station is not available for check-in');
    }
    const cat = memoryState.station_categories.find(c => c.category_id === station.category_id);
    const newSessionId = memoryState.gaming_sessions.length > 0 
      ? Math.max(...memoryState.gaming_sessions.map(s => s.session_id)) + 1 
      : 301;
    const session = {
      session_id: newSessionId,
      booking_id: null,
      user_id: parseInt(userId),
      station_id: parseInt(stationId),
      staff_checkin_id: staffId ? parseInt(staffId) : 2,
      start_time: new Date().toISOString(),
      end_time: null,
      duration_minutes: 0,
      hourly_rate_applied: cat.base_hourly_rate,
      subtotal_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      status: 'ACTIVE',
      payment_status: 'PENDING'
    };
    memoryState.gaming_sessions.push(session);
    station.status = 'OCCUPIED';
    return { session_id: newSessionId };
  }

  if (procName === 'sp_checkout_session') {
    const [sessionId, paymentMethod] = args;
    const session = memoryState.gaming_sessions.find(s => s.session_id === parseInt(sessionId));
    if (!session || session.status !== 'ACTIVE') {
      throw new Error('Session is not active or does not exist');
    }
    const startTime = new Date(session.start_time).getTime();
    const elapsedMinutes = Math.max(Math.round((Date.now() - startTime) / 60000), 15);
    const station = memoryState.gaming_stations.find(s => s.station_id === session.station_id);
    const cat = memoryState.station_categories.find(c => c.category_id === (station ? station.category_id : 1));
    const baseRate = cat ? cat.base_hourly_rate : session.hourly_rate_applied;

    const profile = memoryState.player_profiles.find(p => p.player_id === session.user_id);
    const tier = profile ? memoryState.membership_tiers.find(t => t.tier_id === profile.tier_id) : null;
    const discountPercent = tier ? tier.hourly_discount_percent : 0;

    const grossCharge = Math.round(((baseRate / 60) * elapsedMinutes) * 100) / 100;
    const finalCharge = Math.round((grossCharge * (1 - discountPercent / 100)) * 100) / 100;
    const discountAmount = Math.max(grossCharge - finalCharge, 0);

    if (paymentMethod === 'WALLET') {
      const wallet = memoryState.player_wallets.find(w => w.user_id === session.user_id);
      if (!wallet || wallet.balance < finalCharge) {
        throw new Error('Insufficient wallet balance for session checkout');
      }
      wallet.balance = Math.round((wallet.balance - finalCharge) * 100) / 100;
      memoryState.wallet_transactions.push({
        transaction_id: memoryState.wallet_transactions.length + 1,
        wallet_id: wallet.wallet_id,
        amount: -finalCharge,
        transaction_type: 'SESSION_DEDUCTION',
        reference_id: `SESS-${session.session_id}`,
        description: `Gaming session settlement (${elapsedMinutes} mins)`,
        balance_after: wallet.balance,
        created_at: new Date().toISOString()
      });
    }

    session.end_time = new Date().toISOString();
    session.duration_minutes = elapsedMinutes;
    session.subtotal_amount = grossCharge;
    session.discount_amount = discountAmount;
    session.total_amount = finalCharge;
    session.status = 'COMPLETED';
    session.payment_status = paymentMethod === 'WALLET' ? 'PAID_WALLET' : 'PAID_CARD';

    if (station) {
      station.status = 'AVAILABLE';
    }

    if (profile) {
      profile.total_play_minutes += elapsedMinutes;
    }

    return { total_billed: finalCharge, invoice_number: `INV-2026-000${session.session_id}` };
  }

  if (procName === 'sp_topup_wallet') {
    const [userId, amount, method, ref] = args;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      throw new Error('Top-up amount must be strictly greater than zero');
    }
    let wallet = memoryState.player_wallets.find(w => w.user_id === parseInt(userId));
    if (!wallet) {
      wallet = { wallet_id: memoryState.player_wallets.length + 1, user_id: parseInt(userId), balance: 0, currency: 'INR' };
      memoryState.player_wallets.push(wallet);
    }
    wallet.balance = Math.round((wallet.balance + amt) * 100) / 100;
    memoryState.wallet_transactions.push({
      transaction_id: memoryState.wallet_transactions.length + 1,
      wallet_id: wallet.wallet_id,
      amount: amt,
      transaction_type: 'TOPUP',
      reference_id: ref || `UPI-${Date.now()}`,
      description: `Digital wallet credit top-up via ${method}`,
      balance_after: wallet.balance,
      created_at: new Date().toISOString()
    });

    const profile = memoryState.player_profiles.find(p => p.player_id === parseInt(userId));
    if (profile) {
      profile.loyalty_points += Math.floor(amt / 10); // 1 point per ₹10
    }
    return { new_balance: wallet.balance };
  }

  if (procName === 'sp_generate_staff_payroll') {
    const [startDate, endDate, staffId] = args;
    const activeStaff = memoryState.staff_profiles.filter(s => s.status === 'ACTIVE' && (!staffId || s.staff_id === parseInt(staffId)));
    
    activeStaff.forEach(sp => {
      const completedShifts = memoryState.staff_shifts.filter(sh => sh.staff_id === sp.staff_id && sh.status === 'COMPLETED');
      let totalMinutes = 0;
      completedShifts.forEach(sh => {
        if (sh.actual_start && sh.actual_end) {
          totalMinutes += (new Date(sh.actual_end) - new Date(sh.actual_start)) / 60000;
        } else {
          totalMinutes += 480;
        }
      });
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
      const regHours = Math.min(totalHours, 40);
      const otHours = Math.max(totalHours - 40, 0);
      const basePay = Math.round((regHours * sp.hourly_wage) * 100) / 100;
      const otPay = Math.round((otHours * sp.hourly_wage * 1.5) * 100) / 100;
      const netPay = Math.round((basePay + otPay) * 100) / 100;

      const existingIndex = memoryState.staff_payroll.findIndex(p => p.staff_id === sp.staff_id && p.pay_period_start === startDate);
      const record = {
        payroll_id: existingIndex >= 0 ? memoryState.staff_payroll[existingIndex].payroll_id : memoryState.staff_payroll.length + 1,
        staff_id: sp.staff_id,
        pay_period_start: startDate || '2026-11-16',
        pay_period_end: endDate || '2026-11-30',
        regular_hours: regHours,
        overtime_hours: otHours,
        hourly_rate: sp.hourly_wage,
        base_pay: basePay,
        overtime_pay: otPay,
        bonus: 0.00,
        deductions: 0.00,
        net_pay: netPay,
        payment_status: 'APPROVED'
      };
      if (existingIndex >= 0) {
        memoryState.staff_payroll[existingIndex] = record;
      } else {
        memoryState.staff_payroll.push(record);
      }
    });

    return { success: true, processed_count: activeStaff.length };
  }

  throw new Error(`Routine ${procName} simulation not defined`);
}

module.exports = {
  getPool: () => pool,
  isLive: () => isLiveDb,
  memoryState,
  initDatabase,
  executeSimulation,
  dbConfig
};
