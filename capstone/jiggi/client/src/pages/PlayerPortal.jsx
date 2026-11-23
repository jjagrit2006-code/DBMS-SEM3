import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stationService, sessionService, bookingService } from '../services/api';
import StationCard from '../components/StationCard';
import ActiveSessionHUD from '../components/ActiveSessionHUD';
import GameDetailModal from '../components/GameDetailModal';
import { 
  Gamepad2, 
  Calendar, 
  Play, 
  Activity,
  Layers,
  Sparkles,
  X,
  ChevronRight,
  Flame,
  CheckCircle2,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';

export default function PlayerPortal({ onOpenWallet, onOpenCafe }) {
  const { currentUser, activeSession, setActiveSession, wallet, deductWallet, refreshUser, showToast } = useAuth();
  const [stations, setStations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Games Section State
  const [gameSearch, setGameSearch] = useState('');
  const [selectedGameGenre, setSelectedGameGenre] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState(null);

  // Booking Modal
  const [bookingStation, setBookingStation] = useState(null);
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const loadFloor = async () => {
    try {
      setLoading(true);
      const [stRes, catRes, myRes, gRes] = await Promise.all([
        stationService.getStations(),
        stationService.getCategories(),
        sessionService.getMy(),
        stationService.getGames()
      ]);
      setStations(stRes.data.stations || []);
      setCategories(catRes.data.categories || []);
      setGames(gRes.data.games || []);
      if (myRes.data?.activeSession) {
        setActiveSession(myRes.data.activeSession);
      }
    } catch (err) {
      console.warn('Could not load floor:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloor();
  }, [currentUser?.user_id]);

  const handleStartSession = async (station) => {
    try {
      await sessionService.startSession({
        station_id: station.station_id,
        user_id: currentUser.user_id
      });
      showToast(`Battle Station ${station.station_code} started!`, 'success');
      await loadFloor();
      await refreshUser();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleCheckoutSession = async (session, estimatedCharge) => {
    try {
      const res = await sessionService.checkoutSession({
        session_id: session.session_id,
        payment_method: 'WALLET'
      });
      const billedAmount = res.data?.total_billed || estimatedCharge;
      await deductWallet(billedAmount, `Gaming session checkout (Station ${session.station_code})`);
      showToast(`Session settled. Billed: ₹${billedAmount}`, 'success');
      setActiveSession(null);
      await loadFloor();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingStation || !bookingStartTime || !bookingEndTime) {
      showToast('Select valid start and end times', 'error');
      return;
    }

    setBookingSubmitting(true);
    try {
      await bookingService.createBooking({
        station_id: bookingStation.station_id,
        start_time: bookingStartTime,
        end_time: bookingEndTime,
        deposit_amount: 200.00
      });
      showToast(`Station ${bookingStation.station_code} reserved!`, 'success');
      setBookingStation(null);
      await loadFloor();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const zones = ['ALL', ...new Set(stations.map(s => s.location_zone))];

  const filteredStations = selectedZone === 'ALL'
    ? stations
    : stations.filter(s => s.location_zone === selectedZone);

  const userDiscount = currentUser?.tier?.hourly_discount_percent || 0;
  const availableStations = stations.filter(s => s.status === 'AVAILABLE');
  const occupiedStations = stations.filter(s => s.status === 'OCCUPIED');

  // Breakdown by zone for the live floor summary panel
  const zoneBreakdown = [
    { zone: 'Pro Arena', total: 6, free: stations.filter(s => s.location_zone === 'Pro Arena' && s.status === 'AVAILABLE').length, rate: '₹180/hr' },
    { zone: 'VIP Elite Stage', total: 4, free: stations.filter(s => s.location_zone === 'VIP Elite Stage' && s.status === 'AVAILABLE').length, rate: '₹280/hr' },
    { zone: 'Console Bay', total: 4, free: stations.filter(s => s.location_zone === 'Console Bay' && s.status === 'AVAILABLE').length, rate: '₹150/hr' },
    { zone: 'Sim Racing Pit', total: 2, free: stations.filter(s => s.location_zone === 'Sim Racing Pit' && s.status === 'AVAILABLE').length, rate: '₹350/hr' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Active Session Real-Time HUD */}
      {activeSession && (
        <ActiveSessionHUD
          session={activeSession}
          onCheckout={handleCheckoutSession}
          onOpenCafe={onOpenCafe}
          walletBalance={parseFloat(wallet?.balance || 0)}
        />
      )}

      {/* Luxury Lounge Hero Banner with Photography Background */}
      <div className="relative rounded-xl border border-[#22262E] overflow-hidden mb-8 shadow-lg bg-[#121519]">
        {/* Background Atmosphere Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80"
            alt="Vortex Esports Lounge"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Multi-layered dark charcoal overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F12] via-[#0D0F12]/95 to-[#121519]/85" />
          <div className="absolute inset-0 bg-[#0D0F12]/60" />
        </div>

        {/* Content Container (Above Background) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Left Column: Context & Direct Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#16191E] border border-[#282E38] text-[11px] font-mono text-emerald-400 mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Floor Fleet Live • 16 Custom Battle Stations Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
                Tournament Arena, Sim Racing Pit & VIP Pods
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-[#94A3B8] max-w-xl leading-relaxed">
                Welcome back, <span className="text-[#F8FAFC] font-semibold">{currentUser?.full_name}</span>. 
                Your <span className="text-blue-400 font-bold">{currentUser?.tier?.name || 'Vortex VIP'}</span> pass is active with a{' '}
                <span className="text-[#F8FAFC] font-semibold">{userDiscount}% hourly discount</span> across all battle stations and sim cockpits.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const freeRig = stations.find(s => s.status === 'AVAILABLE');
                  if (freeRig) handleStartSession(freeRig);
                  else showToast('All stations currently in session', 'error');
                }}
                className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 active:scale-[0.99]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Check-In Next Available Rig
              </button>

              <button
                onClick={onOpenWallet}
                className="px-4 py-2.5 rounded-lg bg-[#16191E] hover:bg-[#20252D] border border-[#282E38] text-[#F8FAFC] text-xs font-mono transition-colors shadow-sm"
              >
                Wallet Balance: ₹{parseFloat(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </button>
            </div>
          </div>

          {/* Right Column: Live Floor Telemetry Panel (5 cols) */}
          <div className="lg:col-span-5 rounded-xl bg-[#0D0F12] border border-[#22262E] p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1F242C] mb-3.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-[#F8FAFC]">Live Floor Fleet Status</span>
                </div>
                <span className="text-xs font-mono tabular-nums text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {availableStations.length} of {stations.length} Rigs Free
                </span>
              </div>

              {/* Zone Telemetry Rows */}
              <div className="space-y-2.5 text-xs">
                {zoneBreakdown.map(zb => (
                  <div key={zb.zone} className="flex items-center justify-between py-1 border-b border-[#171A21]">
                    <div className="text-[#94A3B8] font-medium">{zb.zone}</div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-[11px] text-[#64748B]">{zb.rate}</span>
                      <span className={`text-[11px] font-semibold ${zb.free > 0 ? 'text-emerald-400' : 'text-[#64748B]'}`}>
                        {zb.free}/{zb.total} Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#1F242C] flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>VIP Discounted Rate:</span>
              <span className="font-mono tabular-nums text-blue-400 font-semibold">₹135 - ₹262 / hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Filter Navigation */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">Available Battle Stations</h2>
          <p className="text-xs text-[#94A3B8]">Filter by zone to initiate session or reserve in advance</p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121519] border border-[#1F242C] overflow-x-auto shadow-sm">
          {zones.map(z => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                selectedZone === z
                  ? 'bg-[#20252D] text-white border border-[#2F3644] font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
              }`}
            >
              {z === 'ALL' ? `All Fleet (${stations.length})` : z}
            </button>
          ))}
        </div>
      </div>

      {/* Station Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B] text-xs font-mono">
          Loading battle station telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {filteredStations.map(station => (
            <StationCard
              key={station.station_id}
              station={station}
              onStartSession={handleStartSession}
              onBookStation={st => setBookingStation(st)}
              onToggleStatus={() => {}}
              userRole={currentUser?.role}
              userDiscount={userDiscount}
            />
          ))}
        </div>
      )}

      {/* Pre-Installed Esports & Sim Racing Catalog */}
      <div id="games-fleet" className="rounded-xl border border-[#22262E] bg-[#121519] p-6 sm:p-7 mb-8 shadow-sm">
        {/* Header with Title and Global Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-[#1F242C]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#16191E] border border-[#282E38] text-[11px] font-mono text-[#94A3B8] mb-2">
              <Gamepad2 className="h-3.5 w-3.5 text-blue-400" />
              Pre-Loaded Tournament Fleet • 1Gbps Fiber LAN
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
              Installed Games & Sim Racing Titles
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
              Every battle station, PS5 Pro bay, and Fanatec motion cockpit is pre-loaded with official tournament client builds, lowest display latency drivers, and instant login integration.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-[#16191E] border border-[#282E38] text-[#94A3B8]">
              Total Titles: <strong className="text-white">{games.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#16191E] border border-emerald-500/20 text-emerald-400">
              100% Installed & Verified
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-6">
          {/* Genre Category Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#16191E] border border-[#22262E] overflow-x-auto shadow-inner">
            {[
              { id: 'ALL', label: 'All Games' },
              { id: 'VALORANT_FPS', label: '🎯 Valorant & FPS' },
              { id: 'FREEFIRE_BR', label: '🔥 Free Fire & Royale' },
              { id: 'MINECRAFT_SANDBOX', label: '⛏️ Minecraft & Sandbox' },
              { id: 'GTA_RPG', label: '🌆 GTA V & RPG' },
              { id: 'SIM', label: '🏎️ Sim Racing' },
              { id: 'FIGHT_SPORT', label: '⚽ Sports & Fighting' }
            ].map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGameGenre(genre.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  selectedGameGenre === genre.id
                    ? 'bg-[#20252D] text-white border border-[#2F3644] font-semibold shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Valorant, Free Fire, Minecraft..."
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#0D0F12] border border-[#262B35] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-blue-500 transition-colors"
            />
            {gameSearch && (
              <button 
                onClick={() => setGameSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC] p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filtered Games Grid (Generous 4-Column Responsive Layout) */}
        {(() => {
          const filtered = games.filter(game => {
            let matchesGenre = true;
            if (selectedGameGenre === 'VALORANT_FPS') {
              matchesGenre = game.title?.toLowerCase().includes('valorant') || game.genre?.includes('FPS') || game.genre?.includes('Shooter');
            } else if (selectedGameGenre === 'FREEFIRE_BR') {
              matchesGenre = game.title?.toLowerCase().includes('free fire') || game.genre?.includes('Battle Royale');
            } else if (selectedGameGenre === 'MINECRAFT_SANDBOX') {
              matchesGenre = game.title?.toLowerCase().includes('minecraft') || game.genre?.includes('Sandbox');
            } else if (selectedGameGenre === 'GTA_RPG') {
              matchesGenre = game.title?.toLowerCase().includes('theft auto') || game.title?.toLowerCase().includes('gta') || game.genre?.includes('RPG') || game.genre?.includes('Open World');
            } else if (selectedGameGenre === 'SIM') {
              matchesGenre = game.genre?.includes('Sim Racing');
            } else if (selectedGameGenre === 'FIGHT_SPORT') {
              matchesGenre = game.genre?.includes('Sports') || game.genre?.includes('Fighting');
            }

            const q = gameSearch.trim().toLowerCase();
            const matchesSearch = !q || (
              game.title?.toLowerCase().includes(q) ||
              game.genre?.toLowerCase().includes(q) ||
              game.supported_platforms?.toLowerCase().includes(q) ||
              game.optimal_zone?.toLowerCase().includes(q)
            );

            return matchesGenre && matchesSearch;
          });

          if (filtered.length === 0) {
            return (
              <div className="py-16 text-center rounded-xl bg-[#14171C] border border-[#22262E]">
                <Gamepad2 className="h-10 w-10 text-[#64748B] mx-auto mb-3" />
                <div className="text-sm font-semibold text-[#F8FAFC]">No titles matching "{gameSearch}"</div>
                <p className="text-xs text-[#94A3B8] mt-1">Try another search query or switch genre category tab.</p>
                <button
                  onClick={() => { setGameSearch(''); setSelectedGameGenre('ALL'); }}
                  className="mt-4 px-4 py-1.5 rounded-lg bg-[#20252D] text-xs text-blue-400 font-medium hover:bg-[#282F38] transition-colors"
                >
                  Reset Game Filters
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(game => (
                <div
                  key={game.game_id}
                  onClick={() => setSelectedGame(game)}
                  className="group cursor-pointer rounded-xl overflow-hidden bg-[#16191E] border border-[#22262E] hover:border-[#333A48] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Real Game Cover Artwork Preview */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0D0F12]">
                    <img
                      src={game.cover_image_url}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-[#16191E]/20 to-transparent" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-[#0D0F12]/90 text-[10px] font-mono font-medium text-[#94A3B8] border border-[#222730]">
                        {game.genre}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0D0F12]/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                        Installed
                      </span>
                    </div>

                    {/* Bottom Image Overlay Badges */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#0D0F12]/90 text-[#F8FAFC] border border-[#222730]">
                        {game.optimal_zone || 'Pro Arena'}
                      </span>
                      {game.framerate_target && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 font-semibold">
                          {game.framerate_target}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Game Details Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name of Game */}
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-blue-400 transition-colors line-clamp-1">
                        {game.title}
                      </h3>

                      {/* Platform & Specs */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#94A3B8]">
                        <span className="font-mono text-blue-400 font-medium">{game.supported_platforms}</span>
                        {game.player_count && (
                          <>
                            <span>•</span>
                            <span className="truncate">{game.player_count}</span>
                          </>
                        )}
                      </div>

                      {/* Brief Description */}
                      <p className="text-[11px] text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                        {game.description || 'Optimized with low latency settings, 1Gbps fiber connectivity, and instant seating telemetry.'}
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-4 pt-3 border-t border-[#22262E] flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGame(game);
                        }}
                        className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Info className="h-3 w-3" />
                        <span>Specs</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Find rig matching this game
                          const matching = stations.find(s => 
                            s.status === 'AVAILABLE' && 
                            game.optimal_zone && 
                            s.location_zone.toLowerCase().includes(game.optimal_zone.toLowerCase().slice(0, 5))
                          ) || stations.find(s => s.status === 'AVAILABLE');

                          if (matching) {
                            handleStartSession(matching);
                          } else {
                            if (game.optimal_zone) setSelectedZone(game.optimal_zone);
                            showToast(`All rigs for ${game.title} currently in session. Pick another rig.`, 'info');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 active:scale-[0.99] transition-all"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Play on Rig</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Game Detail & Specifications Modal */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onLaunchRig={(rig) => handleStartSession(rig)}
          stations={stations}
        />
      )}

      {/* Advance Reservation Modal */}
      {bookingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl bg-[#16191E] border border-[#282E38] p-6 shadow-2xl">
            <button
              onClick={() => setBookingStation(null)}
              className="absolute top-4 right-4 p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-[#0D0F12] border border-[#282E38] text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  Reserve {bookingStation.station_name || bookingStation.station_code}
                </h3>
                <p className="text-[11px] text-[#94A3B8]">
                  {bookingStation.station_code} • {bookingStation.featured_game ? `🎮 ${bookingStation.featured_game} • ` : ''}{bookingStation.location_zone} • {bookingStation.display_badge}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingStartTime}
                  onChange={e => setBookingStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#262B35] text-xs text-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingEndTime}
                  onChange={e => setBookingEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#262B35] text-xs text-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#222730] text-xs flex justify-between">
                <span className="text-[#94A3B8]">Reservation Hold Deposit:</span>
                <span className="font-mono tabular-nums font-semibold text-[#F8FAFC]">₹200.00</span>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
              >
                {bookingSubmitting ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
