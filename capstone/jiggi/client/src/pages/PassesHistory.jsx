import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Sparkles, Receipt, Wallet, Clock, ArrowRight, Gamepad2, Shield } from 'lucide-react';

export default function PassesHistory({ onOpenWallet, onNavigateStations }) {
  const { currentUser, wallet } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const sRes = await sessionService.getMy().catch(() => ({ data: { history: [] } }));
        setHistory(sRes.data.history || []);
      } catch (err) {
        console.warn('Could not load history:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [currentUser?.user_id]);

  const tier = currentUser?.tier || { name: 'Standard', hourly_discount_percent: 0, loyalty_points: 0 };
  const walletBal = parseFloat(wallet?.balance || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          VIP Passes, Loyalty Perks & Session Receipts
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Member tier privileges, prepaid wallet credits, and verified gaming telemetry records
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Card 1: Membership Tier */}
        <div className="rounded-xl p-5 bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] flex flex-col justify-between shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Member Tier Status
              </span>
              <div className="p-1.5 rounded bg-[#1A1E24] border border-[#272D37] text-blue-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white font-bold">
                {tier.name} Pass
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              {tier.hourly_discount_percent}% off all battle stations & sim cockpits • Priority desk reservation
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F242C] flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Loyalty Balance</span>
            <span className="font-mono tabular-nums font-semibold text-amber-400">
              {tier.loyalty_points || 0} pts
            </span>
          </div>
        </div>

        {/* Card 2: Digital Lounge Wallet in Rupee */}
        <div className="rounded-xl p-5 bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] flex flex-col justify-between shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Digital Lounge Credits
              </span>
              <div className="p-1.5 rounded bg-[#1A1E24] border border-[#272D37] text-blue-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-white">
              ₹{walletBal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Instant 1-tap checkout for gaming rig runtime and barista café orders.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F242C]">
            <button
              onClick={onOpenWallet}
              className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-[#3B82F6]/30 active:scale-[0.99]"
            >
              Top Up Lounge Credits <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Lifetime Lounge Activity */}
        <div className="rounded-xl p-5 bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] flex flex-col justify-between shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Lifetime Gameplay Telemetry
              </span>
              <div className="p-1.5 rounded bg-[#1A1E24] border border-[#272D37] text-cyan-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-white">
              {Math.round((tier.total_play_minutes || 4820) / 60)} hrs
            </div>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Total session runtime logged across all arena rigs and racing cockpits.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F242C] flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Completed Sessions</span>
            <span className="font-mono tabular-nums font-semibold text-white">
              {history.length}
            </span>
          </div>
        </div>
      </div>

      {/* Receipts Table with Tabular Figures and Clear Alignment */}
      <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1F242C] flex items-center justify-between bg-[#121519]">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Verified Session Receipts</h3>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8]">{history.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
              <tr>
                <th className="p-3.5">Session ID</th>
                <th className="p-3.5">Station & Zone</th>
                <th className="p-3.5 text-right">Duration</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">VIP Discount</th>
                <th className="p-3.5 text-right">Billed Amount</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F242C]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#94A3B8]">
                    <div className="max-w-xs mx-auto">
                      <Gamepad2 className="h-6 w-6 text-[#64748B] mx-auto mb-2" />
                      <div className="text-xs text-white font-medium">No past session receipts found</div>
                      <p className="text-[11px] text-[#64748B] mt-1 mb-3">Start a session on any open rig to log your gameplay.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map(s => {
                  const subtotal = parseFloat(s.subtotal_amount || 0);
                  const discount = parseFloat(s.discount_amount || 0);
                  const total = parseFloat(s.total_amount || 0);
                  const duration = s.duration_minutes || s.live_minutes || 0;

                  return (
                    <tr key={s.session_id} className="hover:bg-[#1A1E26] transition-colors">
                      <td className="p-3.5 font-mono text-cyan-400">#{s.session_id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{s.station_code}</div>
                        <div className="text-[10px] text-[#94A3B8]">{s.location_zone}</div>
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-[#94A3B8]">
                        {duration} min
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-[#94A3B8]">
                        ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-blue-400">
                        {discount > 0 ? `-₹${discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right font-semibold text-white">
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-[#94A3B8] font-mono text-[11px]">
                        {s.payment_status === 'PAID_WALLET' ? 'Lounge Wallet' : 'UPI / Desk Card'}
                      </td>
                      <td className="p-3.5 text-center">
                        <StatusBadge status={s.status} size="xs" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
