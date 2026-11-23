import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Gamepad2, 
  Wallet, 
  Coffee, 
  ChevronDown, 
  Sparkles, 
  SlidersHorizontal,
  BarChart3,
  Trophy
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenWallet, 
  onOpenCafe 
}) {
  const { currentUser, wallet, demoAccounts, switchAccount } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const role = currentUser?.role || 'PLAYER';
  const balance = parseFloat(wallet?.balance || 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1F242C] bg-[#0D0F12] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Mark */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none group" 
          onClick={() => setCurrentTab('stations')}
        >
          <div className="h-8 w-8 rounded-lg bg-[#16191E] border border-[#272D37] flex items-center justify-center text-white group-hover:border-[#384150] transition-colors shadow-sm">
            <span className="font-mono text-xs font-bold tracking-tight text-blue-400">VX</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-[#F8FAFC]">
              VORTEX <span className="text-blue-500 font-extrabold">LOUNGE</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider text-[#94A3B8] font-mono px-1.5 py-0.5 rounded bg-[#16191E] border border-[#222730]">
              Esports Arena
            </span>
          </div>
        </div>

        {/* Primary Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121519] p-1 rounded-lg border border-[#1F242C]">
          <button
            onClick={() => setCurrentTab('stations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === 'stations'
                ? 'bg-[#20252D] text-white border border-[#2F3644] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5 text-blue-400" />
            Battle Stations
          </button>

          <button
            onClick={() => {
              if (currentTab !== 'stations') {
                setCurrentTab('stations');
                setTimeout(() => {
                  const el = document.getElementById('games-fleet');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                const el = document.getElementById('games-fleet');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]"
          >
            <Trophy className="h-3.5 w-3.5 text-blue-400" />
            Games Library
          </button>

          <button
            onClick={() => setCurrentTab('cafe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === 'cafe'
                ? 'bg-[#20252D] text-white border border-[#2F3644] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
            }`}
          >
            <Coffee className="h-3.5 w-3.5 text-amber-400" />
            Café & Bar
          </button>

          {role === 'PLAYER' && (
            <button
              onClick={() => setCurrentTab('passes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentTab === 'passes'
                  ? 'bg-[#20252D] text-white border border-[#2F3644] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              VIP Perks & Receipts
            </button>
          )}

          {(role === 'STAFF' || role === 'ADMIN') && (
            <button
              onClick={() => setCurrentTab('floor-control')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentTab === 'floor-control'
                  ? 'bg-[#20252D] text-white border border-[#2F3644] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
              Floor Operations
            </button>
          )}

          {role === 'ADMIN' && (
            <button
              onClick={() => setCurrentTab('admin-hub')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentTab === 'admin-hub'
                  ? 'bg-[#20252D] text-white border border-[#2F3644] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
              Admin Ops
            </button>
          )}
        </nav>

        {/* Right Utility Cluster: Wallet Trigger & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Quick Wallet Balance Pill */}
          {role === 'PLAYER' && (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14171C] border border-[#222730] hover:border-[#2F3543] hover:bg-[#1A1E25] transition-all group shadow-sm"
              title="Open Digital Lounge Wallet"
            >
              <Wallet className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="font-mono tabular-nums text-xs font-semibold text-[#F8FAFC]">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-blue-400 font-medium border-l border-[#272D37] pl-2 group-hover:text-blue-300 transition-colors">
                Top Up
              </span>
            </button>
          )}

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-lg bg-[#14171C] border border-[#222730] hover:border-[#2F3543] hover:bg-[#1A1E25] transition-all"
            >
              <img
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser?.full_name}
                className="h-6 w-6 rounded-md object-cover ring-1 ring-white/[0.1]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
              <span className="text-xs font-medium text-[#F8FAFC] hidden sm:inline">
                {currentUser?.full_name?.split(' ')[0]}
              </span>
              <span className="text-[10px] font-mono px-1 rounded bg-[#20252D] text-[#94A3B8] hidden sm:inline">
                {role}
              </span>
              <ChevronDown className="h-3 w-3 text-[#94A3B8]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#16191E] border border-[#272D37] shadow-xl p-1.5 z-50">
                <div className="px-2.5 py-1.5 border-b border-[#222730] mb-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8]">
                    Switch Account (Role Demo)
                  </div>
                </div>

                <div className="space-y-0.5">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.user_id}
                      onClick={() => {
                        switchAccount(acc);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        currentUser?.user_id === acc.user_id
                          ? 'bg-[#20252D] text-white border border-[#2F3644]'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-[#F8FAFC] truncate">{acc.full_name}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{acc.email}</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 ml-2">
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
