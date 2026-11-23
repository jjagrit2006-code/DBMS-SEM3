import React from 'react';
import StatusBadge from './StatusBadge';
import { Monitor, Cpu, Play } from 'lucide-react';

export default function StationCard({
  station,
  onStartSession,
  onBookStation,
  onToggleStatus,
  userRole = 'PLAYER',
  userDiscount = 0
}) {
  const baseRate = parseFloat(station.base_hourly_rate || 180);
  const discountedRate = userDiscount > 0
    ? Math.round(baseRate * (1 - userDiscount / 100))
    : null;

  const isAvailable = station.status === 'AVAILABLE';
  const isOccupied = station.status === 'OCCUPIED';

  let specs = {};
  try {
    specs = typeof station.specs_json === 'string' 
      ? JSON.parse(station.specs_json) 
      : (station.specs_json || {});
  } catch (e) {
    specs = {};
  }

  // Authentic real game visuals and titles matched to recognizable gaming titles
  const STATION_REAL_GAMES = {
    'PC-01': {
      title: 'VALORANT',
      rigName: 'VALORANT Battle Rig',
      image: 'https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S1_2560x1440-3f7a97d6442c4dd8bab8544872738fc0'
    },
    'PC-02': {
      title: 'Counter-Strike 2',
      rigName: 'Counter-Strike 2 Arena',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg'
    },
    'PC-03': {
      title: 'Apex Legends',
      rigName: 'Apex Legends Rig',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg'
    },
    'PC-04': {
      title: 'PUBG',
      rigName: 'PUBG Battle Rig',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_616x353.jpg'
    },
    'PC-05': {
      title: 'Call of Duty',
      rigName: 'Call of Duty: Warzone Rig',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/capsule_616x353.jpg'
    },
    'PC-06': {
      title: 'Fortnite',
      rigName: 'Fortnite Battle Rig',
      image: 'https://cdn1.epicgames.com/offer/fn/Blade_2560x1440_2560x1440-ae5060b66a50678ab728ab99ee1743a6'
    },
    'VIP-01': {
      title: 'Cyberpunk 2077',
      rigName: 'Cyberpunk 2077 VIP Pod',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg'
    },
    'VIP-02': {
      title: 'GTA V',
      rigName: 'Grand Theft Auto V Suite',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/capsule_616x353.jpg'
    },
    'VIP-03': {
      title: 'Minecraft',
      rigName: 'Minecraft RTX Studio',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Minecraft_Key-art.png'
    },
    'VIP-04': {
      title: 'Rocket League',
      rigName: 'Rocket League VIP Pod',
      image: 'https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef049cb812/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-a1f9a03975a40a2a4b8686e00155b4fe'
    },
    'PS5-01': {
      title: 'EA SPORTS FC 25',
      rigName: 'EA SPORTS FC 25 Lounge',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/capsule_616x353.jpg'
    },
    'PS5-02': {
      title: 'TEKKEN 8',
      rigName: 'TEKKEN 8 Fight Bay',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/capsule_616x353.jpg'
    },
    'PS5-03': {
      title: 'Free Fire MAX',
      rigName: 'Free Fire MAX Battle Bay',
      image: 'https://images.wallpapersden.com/image/download/garena-free-fire-cyborgs_bGpna2WUmZqaraWkpJRobWllrWdma2U.jpg'
    },
    'PS5-04': {
      title: 'Street Fighter 6',
      rigName: 'Street Fighter 6 Arena',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg'
    },
    'SIM-01': {
      title: 'F1 24',
      rigName: 'F1 24 Motion Cockpit',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2488620/capsule_616x353.jpg'
    },
    'SIM-02': {
      title: 'Forza Horizon 5',
      rigName: 'Forza Horizon 5 Motion Pit',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/capsule_616x353.jpg'
    }
  };

  const matchedGame = STATION_REAL_GAMES[station.station_code] || {
    title: station.category_name,
    rigName: `${station.category_name} (${station.station_code})`,
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg'
  };

  const stationDisplayName = station.station_name || matchedGame.rigName;

  const displayImage = (station.image_url && !station.image_url.includes('unsplash.com'))
    ? station.image_url
    : matchedGame.image;

  return (
    <div className={`relative flex flex-col justify-between rounded-xl border overflow-hidden transition-all duration-200 group ${
      isOccupied
        ? 'bg-[#14171C] border-[#2A313E] shadow-sm'
        : isAvailable
        ? 'bg-[#14171C] border-[#22262E] hover:border-[#333A48] hover:shadow-md'
        : 'bg-[#101317] border-[#1C2027] opacity-80'
    }`}>
      <div>
        {/* Rig Image Preview */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0D0F12]">
          <img
            src={displayImage}
            alt={`${station.station_code} - ${matchedGame.title}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = matchedGame.image;
            }}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14171C] via-[#14171C]/30 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0D0F12]/90 text-[#F8FAFC] border border-[#2A313E] shadow-sm flex items-center gap-1.5">
              <span>{station.station_code}</span>
              <span className="text-blue-400 font-semibold">• {matchedGame.title}</span>
            </span>
            <div className="pointer-events-auto">
              <StatusBadge status={station.status} size="xs" />
            </div>
          </div>

          {/* Hardware Badge Pill */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#0D0F12]/90 text-[#94A3B8] border border-[#222730]">
              {station.display_badge || station.category_name}
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0D0F12]/90 text-emerald-400 border border-[#222730] flex items-center gap-1">
              ⚡ 1Gbps LAN
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 pt-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-bold text-[#F8FAFC] truncate">
              {stationDisplayName}
            </div>
            <div className="text-[11px] text-[#94A3B8] font-medium shrink-0 ml-2">{station.location_zone}</div>
          </div>

          <div className="text-[11px] text-[#64748B] mb-2.5 font-mono flex items-center gap-1.5">
            <span className="text-blue-400 font-semibold">{station.station_code}</span>
            <span>•</span>
            <span className="truncate">{station.category_name}</span>
          </div>

          {/* Pricing Line */}
          <div className="flex items-baseline gap-2 mb-3 py-1.5 px-2.5 rounded-lg bg-[#0D0F12] border border-[#20252D]">
            <div className="font-mono tabular-nums text-sm font-bold text-[#F8FAFC]">
              ₹{discountedRate || baseRate.toFixed(0)}
              <span className="text-[11px] font-normal text-[#94A3B8]"> / hr</span>
            </div>
            {discountedRate && (
              <span className="font-mono tabular-nums text-xs text-[#64748B] line-through">
                ₹{baseRate.toFixed(0)}
              </span>
            )}
            {userDiscount > 0 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                {userDiscount}% VIP PASS
              </span>
            )}
          </div>

          {/* Hardware Spec Bullets */}
          <div className="space-y-1 mb-3 text-[11px] text-[#94A3B8]">
            {specs.gpu && (
              <div className="flex items-center gap-1.5 truncate">
                <Cpu className="h-3 w-3 text-blue-400 shrink-0" />
                <span className="truncate">{specs.gpu}</span>
              </div>
            )}
            {specs.monitor && (
              <div className="flex items-center gap-1.5 truncate">
                <Monitor className="h-3 w-3 text-[#64748B] shrink-0" />
                <span className="truncate">{specs.monitor}</span>
              </div>
            )}
            {specs.console && (
              <div className="flex items-center gap-1.5 truncate">
                <Cpu className="h-3 w-3 text-blue-400 shrink-0" />
                <span className="truncate">{specs.console} • {specs.display}</span>
              </div>
            )}
            {specs.wheelbase && (
              <div className="flex items-center gap-1.5 truncate">
                <Cpu className="h-3 w-3 text-blue-400 shrink-0" />
                <span className="truncate">{specs.wheelbase}</span>
              </div>
            )}
          </div>

          {/* Installed Games Chips */}
          <div className="mb-3 pt-2 border-t border-[#20252D]">
            <div className="text-[10px] uppercase tracking-wider font-mono text-[#64748B] mb-1.5 flex items-center justify-between">
              <span>Ready to Launch:</span>
              <span className="text-[#94A3B8] font-medium">Pre-Loaded</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[10px] text-blue-300 font-semibold">
                🎮 {matchedGame.title}
              </span>
              {(station.location_zone === 'Sim Racing Pit' || station.category_id === 4) && (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">🏎️ Assetto Corsa</span>
                </>
              )}
              {(station.location_zone === 'Console Bay' || station.category_id === 3) && (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">🥊 Tekken 8</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">🚀 Rocket League</span>
                </>
              )}
              {(station.location_zone === 'VIP Elite Stage' || station.category_id === 2) && (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">⛏️ Minecraft RTX</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">⚡ Cyberpunk</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">🎯 CS2 360Hz</span>
                </>
              )}
              {(station.location_zone === 'Pro Arena' || station.category_id === 1) && (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">🔥 Free Fire MAX</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">💣 CS2</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1C2027] border border-[#282E38] text-[10px] text-[#CBD5E1]">👑 Apex</span>
                </>
              )}
            </div>
          </div>

          {/* Occupied State Details */}
          {isOccupied && station.active_player_name && (
            <div className="py-1.5 px-2.5 rounded-lg bg-[#0D0F12] border border-[#20252D] text-xs mb-3">
              <span className="text-[10px] text-[#94A3B8]">Player in session:</span>
              <div className="font-medium text-[#F8FAFC] truncate">{station.active_player_name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <div className="pt-2.5 border-t border-[#20252D]">
          {isAvailable && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStartSession(station)}
                className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-colors active:scale-[0.99]"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Start Rig</span>
              </button>
              <button
                onClick={() => onBookStation(station)}
                className="py-2 px-2.5 rounded-lg bg-[#1A1E24] hover:bg-[#222731] text-[#F8FAFC] font-medium text-xs border border-[#282E38] transition-colors"
              >
                Reserve
              </button>
            </div>
          )}

          {isOccupied && userRole === 'PLAYER' && (
            <div className="text-center py-2 text-xs text-[#64748B] font-mono">
              Rig In Use
            </div>
          )}

          {(userRole === 'STAFF' || userRole === 'ADMIN') && (
            <div className="flex items-center justify-between text-[11px] py-1">
              <span className="text-[#64748B] font-mono text-[10px]">
                {station.mac_ip_address}
              </span>
              <button
                onClick={() => onToggleStatus(station)}
                className="text-blue-400 hover:text-blue-300 font-medium text-[11px] transition-colors"
              >
                Toggle State
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
