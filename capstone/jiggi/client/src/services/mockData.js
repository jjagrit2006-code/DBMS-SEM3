// Rich in-memory mock fallback data with authentic real game visuals
// Guarantees 100% visual fidelity even if backend is offline or port is busy

export const MOCK_CATEGORIES = [
  {
    category_id: 1,
    category_code: 'PC_PRO',
    name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    description: 'High-FPS tournament tier rigs tuned for competitive shooters and MOBAs.',
    display_badge: '240Hz OLED',
    image_url: 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-3f7a97d6442c4dd8bab8544872738fc0',
    specs_json: {
      gpu: 'RTX 4080 Super 16GB',
      cpu: 'Core i7-14700K 20-Core',
      ram: '32GB DDR5-6000',
      monitor: '27" ROG 240Hz OLED 0.03ms',
      peripherals: 'Wooting 60HE + Logitech Superlight 2'
    }
  },
  {
    category_id: 2,
    category_code: 'PC_ELITE',
    name: 'VIP Elite Liquid Pod',
    base_hourly_rate: 280.00,
    description: 'Custom open-loop liquid-cooled battle rigs with ultra-wide 360Hz QD-OLED displays in acoustic booths.',
    display_badge: '360Hz Liquid',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg',
    specs_json: {
      gpu: 'RTX 4090 OC 24GB',
      cpu: 'Ryzen 7 7800X3D 8-Core',
      ram: '64GB DDR5-6400',
      monitor: '34" Alienware 360Hz QD-OLED Curved',
      peripherals: 'Custom Mechanical Keeb + Razer Viper Mini SE'
    }
  },
  {
    category_id: 3,
    category_code: 'CONSOLE_PS5',
    name: 'Console Lounge Bay',
    base_hourly_rate: 150.00,
    description: 'Private leather recliners with PlayStation 5 Pro & 4K 120Hz OLED HDR displays.',
    display_badge: '4K 120Hz OLED',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg',
    specs_json: {
      console: 'PlayStation 5 Pro 2TB',
      display: '55" LG C4 4K 120Hz OLED HDR',
      audio: 'SteelSeries Arctis Nova Pro Wireless',
      controllers: 'DualSense Edge Controllers'
    }
  },
  {
    category_id: 4,
    category_code: 'SIM_RACING',
    name: 'Sim Racing Motion Pit',
    base_hourly_rate: 350.00,
    description: 'Direct-drive force feedback cockpits with hydraulic load-cell pedals and triple panoramic surround wrap screens.',
    display_badge: 'Direct Drive Sim',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2488620/capsule_616x353.jpg',
    specs_json: {
      wheelbase: 'Fanatec ClubSport DD+ 15Nm Direct Drive',
      cockpit: 'Next Level Racing GTTrack with Motion Platform V3',
      pedals: 'Heusinkveld Sprint Load Cell',
      displays: 'Triple 32" 1440p 165Hz Curved'
    }
  }
];

export const MOCK_STATIONS = [
  {
    station_id: 1,
    station_code: 'PC-01',
    category_id: 1,
    status: 'OCCUPIED',
    location_zone: 'Pro Arena',
    mac_ip_address: '192.168.10.101',
    notes: 'Row A - Center Stage',
    category_name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    display_badge: '240Hz OLED',
    station_name: 'VALORANT Battle Rig',
    featured_game: 'VALORANT',
    image_url: 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-3f7a97d6442c4dd8bab8544872738fc0',
    specs_json: { gpu: 'RTX 4080 Super 16GB', monitor: '27" ROG 240Hz OLED' },
    active_player_name: 'Rohan Verma'
  },
  {
    station_id: 2,
    station_code: 'PC-02',
    category_id: 1,
    status: 'AVAILABLE',
    location_zone: 'Pro Arena',
    mac_ip_address: '192.168.10.102',
    notes: 'Row A - Right Wing',
    category_name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    display_badge: '240Hz OLED',
    station_name: 'Counter-Strike 2 Arena',
    featured_game: 'Counter-Strike 2',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
    specs_json: { gpu: 'RTX 4080 Super 16GB', monitor: '27" ROG 240Hz OLED' }
  },
  {
    station_id: 3,
    station_code: 'PC-03',
    category_id: 1,
    status: 'AVAILABLE',
    location_zone: 'Pro Arena',
    mac_ip_address: '192.168.10.103',
    notes: 'Row B - Left Wing',
    category_name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    display_badge: '240Hz OLED',
    station_name: 'Apex Legends Rig',
    featured_game: 'Apex Legends',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg',
    specs_json: { gpu: 'RTX 4080 Super 16GB', monitor: '27" ROG 240Hz OLED' }
  },
  {
    station_id: 4,
    station_code: 'PC-04',
    category_id: 1,
    status: 'OCCUPIED',
    location_zone: 'Pro Arena',
    mac_ip_address: '192.168.10.104',
    notes: 'Row B - Center Stage',
    category_name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    display_badge: '240Hz OLED',
    station_name: 'PUBG Battle Rig',
    featured_game: 'PUBG',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_616x353.jpg',
    specs_json: { gpu: 'RTX 4080 Super 16GB', monitor: '27" ROG 240Hz OLED' },
    active_player_name: 'Priya Sen'
  },
  {
    station_id: 5,
    station_code: 'PC-05',
    category_id: 1,
    status: 'MAINTENANCE',
    location_zone: 'Pro Arena',
    mac_ip_address: '192.168.10.105',
    notes: 'DisplayPort cable swap scheduled',
    category_name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    display_badge: '240Hz OLED',
    station_name: 'Call of Duty: Warzone Rig',
    featured_game: 'Call of Duty',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/capsule_616x353.jpg',
    specs_json: { gpu: 'RTX 4080 Super 16GB', monitor: '27" ROG 240Hz OLED' }
  },
  {
    station_id: 6,
    station_code: 'PC-06',
    category_id: 1,
    status: 'AVAILABLE',
    location_zone: 'Pro Arena',
    mac_ip_address: '192.168.10.106',
    notes: 'Row C - Soundproof Booth',
    category_name: 'Esports Pro Arena',
    base_hourly_rate: 180.00,
    display_badge: '240Hz OLED',
    station_name: 'Fortnite Battle Rig',
    featured_game: 'Fortnite',
    image_url: 'https://cdn1.epicgames.com/offer/fn/Blade_2560x1440_2560x1440-ae5060b66a50678ab728ab99ee1743a6',
    specs_json: { gpu: 'RTX 4080 Super 16GB', monitor: '27" ROG 240Hz OLED' }
  },
  {
    station_id: 7,
    station_code: 'VIP-01',
    category_id: 2,
    status: 'OCCUPIED',
    location_zone: 'VIP Elite Stage',
    mac_ip_address: '192.168.20.101',
    notes: 'Private Acoustic Booth Alpha',
    category_name: 'VIP Elite Liquid Pod',
    base_hourly_rate: 280.00,
    display_badge: '360Hz Liquid',
    station_name: 'Cyberpunk 2077 VIP Pod',
    featured_game: 'Cyberpunk 2077',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg',
    specs_json: { gpu: 'RTX 4090 OC 24GB', monitor: '34" Alienware 360Hz QD-OLED' },
    active_player_name: 'Aarav Sharma'
  },
  {
    station_id: 8,
    station_code: 'VIP-02',
    category_id: 2,
    status: 'AVAILABLE',
    location_zone: 'VIP Elite Stage',
    mac_ip_address: '192.168.20.102',
    notes: 'Private Acoustic Booth Beta',
    category_name: 'VIP Elite Liquid Pod',
    base_hourly_rate: 280.00,
    display_badge: '360Hz Liquid',
    station_name: 'Grand Theft Auto V Suite',
    featured_game: 'GTA V',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/capsule_616x353.jpg',
    specs_json: { gpu: 'RTX 4090 OC 24GB', monitor: '34" Alienware 360Hz QD-OLED' }
  },
  {
    station_id: 9,
    station_code: 'VIP-03',
    category_id: 2,
    status: 'RESERVED',
    location_zone: 'VIP Elite Stage',
    mac_ip_address: '192.168.20.103',
    notes: 'Tournament Streaming Rig',
    category_name: 'VIP Elite Liquid Pod',
    base_hourly_rate: 280.00,
    display_badge: '360Hz Liquid',
    station_name: 'Minecraft RTX Studio',
    featured_game: 'Minecraft RTX',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Minecraft_Key-art.png',
    specs_json: { gpu: 'RTX 4090 OC 24GB', monitor: '34" Alienware 360Hz QD-OLED' }
  },
  {
    station_id: 10,
    station_code: 'VIP-04',
    category_id: 2,
    status: 'AVAILABLE',
    location_zone: 'VIP Elite Stage',
    mac_ip_address: '192.168.20.104',
    notes: 'Creator Lounge Suite',
    category_name: 'VIP Elite Liquid Pod',
    base_hourly_rate: 280.00,
    display_badge: '360Hz Liquid',
    station_name: 'Rocket League VIP Pod',
    featured_game: 'Rocket League',
    image_url: 'https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef049cb812/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-a1f9a03975a40a2a4b8686e00155b4fe',
    specs_json: { gpu: 'RTX 4090 OC 24GB', monitor: '34" Alienware 360Hz QD-OLED' }
  },
  {
    station_id: 11,
    station_code: 'PS5-01',
    category_id: 3,
    status: 'AVAILABLE',
    location_zone: 'Console Bay',
    mac_ip_address: '192.168.30.101',
    notes: 'Leather Double Recliner 1',
    category_name: 'Console Lounge Bay',
    base_hourly_rate: 150.00,
    display_badge: '4K 120Hz OLED',
    station_name: 'EA SPORTS FC 25 Lounge',
    featured_game: 'EA SPORTS FC 25',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg',
    specs_json: { console: 'PlayStation 5 Pro 2TB', display: '55" LG C4 4K OLED' }
  },
  {
    station_id: 12,
    station_code: 'PS5-02',
    category_id: 3,
    status: 'OCCUPIED',
    location_zone: 'Console Bay',
    mac_ip_address: '192.168.30.102',
    notes: 'Leather Double Recliner 2',
    category_name: 'Console Lounge Bay',
    base_hourly_rate: 150.00,
    display_badge: '4K 120Hz OLED',
    station_name: 'TEKKEN 8 Fight Bay',
    featured_game: 'TEKKEN 8',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/capsule_616x353.jpg',
    specs_json: { console: 'PlayStation 5 Pro 2TB', display: '55" LG C4 4K OLED' },
    active_player_name: 'Devansh Patel'
  },
  {
    station_id: 13,
    station_code: 'PS5-03',
    category_id: 3,
    status: 'AVAILABLE',
    location_zone: 'Console Bay',
    mac_ip_address: '192.168.30.103',
    notes: 'Party Couch Pod 3',
    category_name: 'Console Lounge Bay',
    base_hourly_rate: 150.00,
    display_badge: '4K 120Hz OLED',
    station_name: 'Free Fire MAX Battle Bay',
    featured_game: 'Free Fire MAX',
    image_url: 'https://images.wallpapersden.com/image/download/garena-free-fire-cyborgs_bGpna2WUmZqaraWkpJRobWllrWdma2U.jpg',
    specs_json: { console: 'PlayStation 5 Pro 2TB', display: '55" LG C4 4K OLED' }
  },
  {
    station_id: 14,
    station_code: 'PS5-04',
    category_id: 3,
    status: 'AVAILABLE',
    location_zone: 'Console Bay',
    mac_ip_address: '192.168.30.104',
    notes: 'Party Couch Pod 4',
    category_name: 'Console Lounge Bay',
    base_hourly_rate: 150.00,
    display_badge: '4K 120Hz OLED',
    station_name: 'Street Fighter 6 Arena',
    featured_game: 'Street Fighter 6',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg',
    specs_json: { console: 'PlayStation 5 Pro 2TB', display: '55" LG C4 4K OLED' }
  },
  {
    station_id: 15,
    station_code: 'SIM-01',
    category_id: 4,
    status: 'OCCUPIED',
    location_zone: 'Sim Racing Pit',
    mac_ip_address: '192.168.40.101',
    notes: 'F1 Cockpit Rig 1',
    category_name: 'Sim Racing Motion Pit',
    base_hourly_rate: 350.00,
    display_badge: 'Direct Drive Sim',
    station_name: 'F1 24 Motion Cockpit',
    featured_game: 'F1 24',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2488620/capsule_616x353.jpg',
    specs_json: { wheelbase: 'Fanatec DD+ 15Nm', cockpit: 'GTTrack Motion V3' },
    active_player_name: 'Rithvik Nair'
  },
  {
    station_id: 16,
    station_code: 'SIM-02',
    category_id: 4,
    status: 'AVAILABLE',
    location_zone: 'Sim Racing Pit',
    mac_ip_address: '192.168.40.102',
    notes: 'GT Racing Rig 2',
    category_name: 'Sim Racing Motion Pit',
    base_hourly_rate: 350.00,
    display_badge: 'Direct Drive Sim',
    station_name: 'Forza Horizon 5 Motion Pit',
    featured_game: 'Forza Horizon 5',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/capsule_616x353.jpg',
    specs_json: { wheelbase: 'Fanatec DD+ 15Nm', cockpit: 'GTTrack Motion V3' }
  }
];

export const MOCK_GAMES = [
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
    is_installed: true,
    tags: ['Riot Games', 'Vanguard', 'Tournament Client', 'Ranked Radiant']
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
    is_installed: true,
    tags: ['Valve', 'Sub-Tick', 'Major Tournament', 'Dust II / Mirage']
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
    is_installed: true,
    tags: ['Rockstar Games', 'FiveM Roleplay', 'Los Santos', '4K Ultra']
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
    is_installed: true,
    tags: ['EA Sports', 'DualSense Edge', '4K OLED', 'Ultimate Team']
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
    is_installed: true,
    tags: ['Xbox Game Studios', 'Direct Drive 15Nm', 'Mexico', 'Horizon Festival']
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
    is_installed: true,
    tags: ['Activision', 'Custom Private Lobbies', 'High Tickrate', 'Urzikstan']
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
    is_installed: true,
    tags: ['EA / Respawn', 'ALGS Tournament', '120Hz Console']
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
    is_installed: true,
    tags: ['Epic Games', 'Zero Build', 'Unreal Engine 5', 'Ranked Cup']
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
    is_installed: true,
    tags: ['Psyonix', 'RLCS Esports', 'Cross-Platform', 'Octane']
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
    is_installed: true,
    tags: ['EA Sports', 'Codemasters', 'Direct Drive DD+', 'Monaco / Silverstone']
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
    is_installed: true,
    tags: ['KRAFTON', 'Erangel', 'Tactical BR', 'Esports PGS']
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
    is_installed: true,
    tags: ['Mojang', 'RTX Ray Tracing', 'Hypixel Ready', 'Custom Modpacks']
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
    is_installed: true,
    tags: ['Garena', 'Battle Royale', '10-Min Fast Action', 'Bermuda Map']
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
    is_installed: true,
    tags: ['Bandai Namco', 'EVO Standard', 'Low Latency', 'Arcade Sticks']
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
    is_installed: true,
    tags: ['CD Projekt Red', 'RTX 4090', 'DLSS 3.5', 'Dogtown']
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
    is_installed: true,
    tags: ['Kunos Simulazioni', 'GT3 Championship', 'Telemetry Pro', 'Monza']
  }
];

export const MOCK_CAFE_CATEGORIES = [
  { cafe_cat_id: 1, name: 'Chilled Energy & Drinks', display_order: 1, description: 'Esports coolers, craft energy cans, and artisan sodas.' },
  { cafe_cat_id: 2, name: 'Artisan Coffee & Cold Brew', display_order: 2, description: 'Single-origin espresso, nitrogen cold brew, and matcha.' },
  { cafe_cat_id: 3, name: 'Hot Lounge Snacks & Bites', display_order: 3, description: 'Crispy finger foods, loaded tenders, truffle fries, and sliders.' },
  { cafe_cat_id: 4, name: 'Desserts & Sweet Fuel', display_order: 4, description: 'Warm baked cookies, churros, and dessert bowls.' }
];

export const MOCK_CAFE_ITEMS = [
  { item_id: 1, cafe_cat_id: 1, name: 'Monster Ultra Peachy Keen', description: 'Zero-sugar crisp peach energy can with 160mg clean caffeine.', price: 160.00, stock_quantity: 48, is_available: 1, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
  { item_id: 2, cafe_cat_id: 1, name: 'Red Bull Energy Cooler', description: 'Chilled taurine reviver with crushed ice and citrus zest.', price: 175.00, stock_quantity: 36, is_available: 1, image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' },
  { item_id: 3, cafe_cat_id: 1, name: 'Vortex Electric Blue Mojito', description: 'Sparkling citrus soda, fresh mint, blue curacao syrup, popping boba.', price: 190.00, stock_quantity: 50, is_available: 1, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
  { item_id: 4, cafe_cat_id: 1, name: 'San Pellegrino Sparkling Blood Orange', description: 'Italian sparkling mineral water with Mediterranean citrus.', price: 140.00, stock_quantity: 60, is_available: 1, image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500' },
  { item_id: 5, cafe_cat_id: 2, name: 'Vortex Nitro Cold Brew', description: 'Steeped for 20 hours, nitrogen-charged for a rich velvet crema.', price: 210.00, stock_quantity: 40, is_available: 1, image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500' },
  { item_id: 6, cafe_cat_id: 2, name: 'Double Shot Espresso Romano', description: 'Single-origin roast with a caramelized twist of fresh lemon peel.', price: 150.00, stock_quantity: 80, is_available: 1, image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500' },
  { item_id: 7, cafe_cat_id: 2, name: 'Iced Ceremonial Matcha Latte', description: 'Uji Kyoto organic matcha layered over creamy oat milk.', price: 240.00, stock_quantity: 32, is_available: 1, image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500' },
  { item_id: 8, cafe_cat_id: 3, name: 'Truffle Parmesan Hand-Cut Fries', description: 'Russet fries tossed in white truffle oil, shaved parmesan, garlic dip.', price: 220.00, stock_quantity: 45, is_available: 1, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
  { item_id: 9, cafe_cat_id: 3, name: 'Crispy Korean BBQ Chicken Tenders', description: 'Crispy buttermilk tenders glazed in sweet spicy gochujang.', price: 310.00, stock_quantity: 30, is_available: 1, image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
  { item_id: 10, cafe_cat_id: 3, name: 'Twin Smash Cheeseburger Sliders', description: 'Crispy edge patties, melted sharp cheddar, caramelized onions.', price: 340.00, stock_quantity: 25, is_available: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { item_id: 11, cafe_cat_id: 3, name: 'Loaded Jalapeño Queso Nachos', description: 'Warm tortilla crisps, four-cheese queso, pickled jalapeños, salsa.', price: 260.00, stock_quantity: 28, is_available: 1, image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
  { item_id: 12, cafe_cat_id: 4, name: 'Molten Chocolate Skillet Cookie', description: 'Freshly baked cookie with dark chocolate core and vanilla bean gelato.', price: 240.00, stock_quantity: 22, is_available: 1, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500' },
  { item_id: 13, cafe_cat_id: 4, name: 'Cinnamon Spanish Churros', description: 'Golden fried churros dusted in Saigon cinnamon with dark dip.', price: 210.00, stock_quantity: 35, is_available: 1, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500' }
];

export const MOCK_DEMO_USERS = [
  {
    user_id: 5,
    username: 'aarav_sharma',
    email: 'aarav@vortexgamer.in',
    role: 'PLAYER',
    full_name: 'Aarav Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: { name: 'Vortex VIP', hourly_discount_percent: 25, loyalty_points: 3850 },
    wallet: { balance: 2450.00, currency: 'INR' }
  },
  {
    user_id: 2,
    username: 'ananya_floor',
    email: 'ananya@vortexlounge.in',
    role: 'STAFF',
    full_name: 'Ananya Nair',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    tier: { name: 'Standard', hourly_discount_percent: 0, loyalty_points: 0 },
    wallet: { balance: 0.00, currency: 'INR' }
  },
  {
    user_id: 1,
    username: 'vikram_ops',
    email: 'admin@vortexlounge.in',
    role: 'ADMIN',
    full_name: 'Vikram Malhotra',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    tier: { name: 'Standard', hourly_discount_percent: 0, loyalty_points: 0 },
    wallet: { balance: 0.00, currency: 'INR' }
  }
];

export const MOCK_ACTIVE_SESSION = {
  session_id: 201,
  station_id: 7,
  station_code: 'VIP-01',
  category_name: 'VIP Elite Liquid Pod',
  location_zone: 'VIP Elite Stage',
  hourly_rate_applied: 280.00,
  hourly_discount_percent: 25,
  start_time: new Date(Date.now() - 4320000).toISOString()
};

export const MOCK_SUMMARY = {
  activeFloorUtilizationPercent: 25,
  occupiedCount: 4,
  totalStationsCount: 16,
  todayGrossRevenue: 28450,
  onDutyStaffCount: 1,
  pendingCafeOrdersCount: 2
};

export const getStoredBalance = () => {
  try {
    const saved = localStorage.getItem('vortex_wallet_balance');
    if (saved !== null) {
      const num = parseFloat(saved);
      if (!isNaN(num)) return num;
    }
  } catch (e) {}
  return 2450.00;
};

export const getStoredTransactions = () => {
  try {
    const saved = localStorage.getItem('vortex_wallet_transactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [
    { transaction_id: 1, amount: 2000.00, description: 'Digital wallet credit top-up via UPI', created_at: new Date(Date.now() - 432000000).toISOString() },
    { transaction_id: 2, amount: 1000.00, description: 'Digital wallet credit top-up via UPI', created_at: new Date(Date.now() - 86400000).toISOString() },
    { transaction_id: 3, amount: -550.00, description: 'Café snack: Nitro Cold Brew & Truffle Fries', created_at: new Date(Date.now() - 86400000).toISOString() }
  ];
};
