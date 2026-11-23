import React from 'react';
import { X, Play, Monitor, Cpu, Sparkles, CheckCircle2, Shield, Users, ArrowUpRight } from 'lucide-react';

export default function GameDetailModal({ game, onClose, onLaunchRig, stations = [] }) {
  if (!game) return null;

  // Find stations matching this game's optimal zone
  const matchingStations = stations.filter(s => {
    if (game.optimal_zone) {
      return s.location_zone.toLowerCase().includes(game.optimal_zone.toLowerCase().slice(0, 5));
    }
    return true;
  });

  const availableRig = matchingStations.find(s => s.status === 'AVAILABLE') || stations.find(s => s.status === 'AVAILABLE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-xl bg-[#14171C] border border-[#272D37] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-lg bg-[#0D0F12]/90 hover:bg-[#1E232B] border border-[#272D37] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero Banner with Game Artwork */}
        <div className="relative aspect-[21/9] sm:aspect-[2/1] w-full overflow-hidden bg-[#0D0F12] shrink-0">
          <img
            src={game.cover_image_url}
            alt={game.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14171C] via-[#14171C]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F12]/80 via-transparent to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded bg-[#0D0F12]/90 text-[11px] font-mono text-[#94A3B8] border border-[#272D37]">
              {game.genre}
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0D0F12]/90 text-[11px] font-mono text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Installed & Patched
            </span>
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight drop-shadow-sm">
              {game.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#94A3B8]">
              <span className="text-blue-400 font-mono font-medium">{game.supported_platforms}</span>
              <span>•</span>
              <span>Optimal Zone: <strong className="text-[#F8FAFC]">{game.optimal_zone || 'Pro Arena'}</strong></span>
              {game.framerate_target && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-mono font-semibold">{game.framerate_target}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] font-mono mb-2">
              Game Overview & Lounge Deployment
            </h4>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              {game.description || 'Pre-installed with zero input-lag drivers, gigabit LAN updates, and official competitive anti-cheat telemetry.'}
            </p>
          </div>

          {/* Telemetry & Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#101317] border border-[#20252D]">
              <div className="text-[10px] text-[#64748B] uppercase font-mono mb-1">Target FPS</div>
              <div className="text-sm font-bold text-[#F8FAFC] font-mono">{game.framerate_target || '240+ FPS'}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#101317] border border-[#20252D]">
              <div className="text-[10px] text-[#64748B] uppercase font-mono mb-1">Match Type</div>
              <div className="text-xs font-semibold text-[#F8FAFC]">{game.player_count || 'Competitive'}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#101317] border border-[#20252D]">
              <div className="text-[10px] text-[#64748B] uppercase font-mono mb-1">LAN Connection</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">1Gbps Fiber</div>
            </div>

            <div className="p-3 rounded-lg bg-[#101317] border border-[#20252D]">
              <div className="text-[10px] text-[#64748B] uppercase font-mono mb-1">Driver State</div>
              <div className="text-xs font-semibold text-blue-400">Tournament Patch</div>
            </div>
          </div>

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <div>
              <div className="text-[11px] font-mono text-[#94A3B8] mb-2">Features & Certifications:</div>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#16191E] border border-[#222730] text-xs text-[#94A3B8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compatible Battle Stations in Lounge */}
          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#20252D]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-blue-400" />
                Live Matching Rigs ({matchingStations.length} Total)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                {matchingStations.filter(s => s.status === 'AVAILABLE').length} Available Now
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {matchingStations.slice(0, 8).map(st => (
                <div 
                  key={st.station_id}
                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                    st.status === 'AVAILABLE'
                      ? 'bg-[#14171C] border-[#262C36] text-[#F8FAFC]'
                      : 'bg-[#101317] border-[#1C2027] text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span>{st.station_code}</span>
                    <span className={`text-[9px] px-1 rounded ${st.status === 'AVAILABLE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                      {st.status === 'AVAILABLE' ? 'FREE' : 'IN USE'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] truncate mt-1">₹{st.base_hourly_rate}/hr</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#1F242C] bg-[#101317] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-[#16191E] hover:bg-[#20252D] border border-[#272D37] text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            Close Overview
          </button>

          {availableRig ? (
            <button
              onClick={() => {
                onLaunchRig(availableRig);
                onClose();
              }}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Launch {game.title} on {availableRig.station_code}</span>
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-2.5 rounded-lg bg-[#16191E] border border-[#222730] text-[#64748B] text-xs font-medium cursor-not-allowed"
            >
              All Matching Rigs Currently Occupied
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
