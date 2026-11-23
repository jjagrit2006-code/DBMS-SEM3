import React, { useState, useEffect } from 'react';
import { Clock, Coffee, StopCircle, Zap } from 'lucide-react';

export default function ActiveSessionHUD({
  session,
  onCheckout,
  onOpenCafe,
  walletBalance = 0
}) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!session || !session.start_time) return;

    const startMs = new Date(session.start_time).getTime();
    const updateElapsed = () => {
      const nowMs = Date.now();
      const diffSecs = Math.max(Math.floor((nowMs - startMs) / 1000), 0);
      setSecondsElapsed(diffSecs);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session?.start_time]);

  if (!session) return null;

  const hours = Math.floor(secondsElapsed / 3600);
  const minutes = Math.floor((secondsElapsed % 3600) / 60);
  const seconds = secondsElapsed % 60;

  const billableMinutes = Math.max(Math.ceil(secondsElapsed / 60), 15);
  const baseRate = parseFloat(session.hourly_rate_applied || 180);
  const discountPercent = parseFloat(session.hourly_discount_percent || 0);

  const grossEstimate = (baseRate / 60) * billableMinutes;
  const netEstimate = Math.round(grossEstimate * (1 - discountPercent / 100));

  return (
    <div className="w-full rounded-xl bg-[#14171C] border border-[#272D37] p-4 mb-6 shadow-md transition-all">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Rig details */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <div className="h-11 w-11 rounded-lg bg-[#0D0F12] border border-[#272D37] flex items-center justify-center font-mono text-base font-bold text-white shadow-sm">
            {session.station_code || 'RIG'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live Active Session
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1E24] text-[#94A3B8] font-mono border border-[#272D37]">
                {session.category_name || 'Pro Rig'}
              </span>
            </div>
            <div className="font-semibold text-sm text-[#F8FAFC] mt-0.5">
              {session.station_name || `Station ${session.station_code}`} • {session.featured_game ? `🎮 ${session.featured_game}` : (session.location_zone || 'Pro Arena')}
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono tabular-nums">
              Rate: ₹{baseRate.toFixed(0)}/hr 
              {discountPercent > 0 && (
                <span className="text-blue-400 ml-1.5 font-medium">
                  ({discountPercent}% VIP Discount Applied)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Current Tab in Rupee */}
        <div className="flex items-center gap-6 py-2 px-5 rounded-lg bg-[#0D0F12] border border-[#222730]">
          <div className="text-center">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-[#94A3B8]" /> Session Runtime
            </div>
            <div className="font-mono tabular-nums text-xl font-bold text-[#F8FAFC] mt-0.5 tracking-tight">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-[#64748B] font-mono">15m minimum block</div>
          </div>

          <div className="h-8 w-px bg-[#222730]" />

          <div className="text-center">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8]">
              Current Tab
            </div>
            <div className="font-mono tabular-nums text-xl font-bold text-[#F8FAFC] mt-0.5 tracking-tight">
              ₹{netEstimate.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Wallet settlement</div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <button
            onClick={() => onOpenCafe(session.station_code)}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#1A1E24] hover:bg-[#222731] text-[#F8FAFC] font-medium text-xs border border-[#282E38] transition-colors shadow-sm"
          >
            <Coffee className="h-3.5 w-3.5 text-amber-400" />
            <span>Order Snacks to Rig</span>
          </button>

          <button
            onClick={() => onCheckout(session, netEstimate)}
            className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
          >
            <StopCircle className="h-3.5 w-3.5" />
            <span>End Session (₹{netEstimate})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
