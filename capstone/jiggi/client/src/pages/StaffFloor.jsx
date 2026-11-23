import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stationService, sessionService, cafeService, staffService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  SlidersHorizontal, 
  Clock, 
  Coffee, 
  Play, 
  Calendar, 
  Plus, 
  X,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function StaffFloor() {
  const { currentUser, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions');

  const [activeSessions, setActiveSessions] = useState([]);
  const [stations, setStations] = useState([]);
  const [cafeOrders, setCafeOrders] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quick Check-in Modal
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinStationId, setCheckinStationId] = useState('');
  const [checkinUserId, setCheckinUserId] = useState('');

  // Leave Request Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('VACATION');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessRes, stRes, ordRes, shRes, lvRes] = await Promise.all([
        sessionService.getActive().catch(() => ({ data: { sessions: [] } })),
        stationService.getStations().catch(() => ({ data: { stations: [] } })),
        cafeService.getOrders().catch(() => ({ data: { orders: [] } })),
        staffService.getShifts(currentUser.user_id).catch(() => ({ data: { shifts: [] } })),
        staffService.getLeaves(currentUser.user_id).catch(() => ({ data: { leaves: [] } }))
      ]);

      setActiveSessions(sessRes.data.sessions || []);
      setStations(stRes.data.stations || []);
      setCafeOrders(ordRes.data.orders || []);
      setShifts(shRes.data.shifts || []);
      setLeaves(lvRes.data.leaves || []);
    } catch (err) {
      console.warn('Error loading staff dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.user_id]);

  const handleCheckout = async (sessionId) => {
    try {
      const res = await sessionService.checkoutSession({
        session_id: sessionId,
        payment_method: 'WALLET'
      });
      showToast(`Session #${sessionId} settled! Total: ₹${res.data.total_billed || '0.00'}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleQuickCheckin = async (e) => {
    e.preventDefault();
    if (!checkinStationId || !checkinUserId) {
      showToast('Select both a station and a player', 'error');
      return;
    }

    try {
      await sessionService.startSession({
        station_id: parseInt(checkinStationId, 10),
        user_id: parseInt(checkinUserId, 10)
      });
      showToast('Live session initiated successfully!', 'success');
      setShowCheckinModal(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await cafeService.updateStatus(orderId, newStatus);
      showToast(`Order #${orderId} set to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleTimeclock = async (action) => {
    try {
      const res = await staffService.timeclock(action);
      showToast(res.data.message || 'Timeclock logged!', 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      await staffService.submitLeave({
        leave_type: leaveType,
        start_date: leaveStart,
        end_date: leaveEnd,
        reason: leaveReason
      });
      showToast('Leave request submitted to Lounge Manager', 'success');
      setShowLeaveModal(false);
      setLeaveReason('');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const occupiedCount = stations.filter(s => s.status === 'OCCUPIED').length;
  const availableCount = stations.filter(s => s.status === 'AVAILABLE').length;
  const currentShift = shifts.find(s => s.status === 'ON_DUTY') || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Floor Command Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              Floor Operations Console
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A1E24] text-[#94A3B8] border border-[#272D37]">
              Live Shift
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Floor Operations & Shift Telemetry
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Supervisor on Duty: <span className="text-white font-medium">{currentUser?.full_name}</span> • 
            Status: <span className={currentShift ? 'text-emerald-400 font-mono ml-1' : 'text-[#64748B] font-mono ml-1'}>
              {currentShift ? 'Active Clocked In' : 'Off Duty'}
            </span>
          </p>
        </div>

        {/* Timeclock Controls */}
        <div className="flex items-center gap-2.5">
          {currentShift ? (
            <button
              onClick={() => handleTimeclock('CLOCK_OUT')}
              className="px-3.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" /> Clock Out
            </button>
          ) : (
            <button
              onClick={() => handleTimeclock('CLOCK_IN')}
              className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" /> Clock In
            </button>
          )}

          <button
            onClick={() => setShowCheckinModal(true)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-[#3B82F6]/30 active:scale-[0.99]"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Quick Seat Player
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Active Rigs</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-cyan-400 mt-1">{occupiedCount}</div>
          <span className="text-[10px] text-[#64748B]">of 16 total</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Available Rigs</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-400 mt-1">{availableCount}</div>
          <span className="text-[10px] text-[#64748B]">Ready for walk-in</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Kitchen Queue</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-400 mt-1">
            {cafeOrders.filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING').length}
          </div>
          <span className="text-[10px] text-[#64748B]">Orders in prep</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Shift Hours</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-white mt-1">
            {shifts.filter(s => s.status === 'COMPLETED').length * 8}h
          </div>
          <span className="text-[10px] text-[#64748B]">This pay period</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#1F242C] mb-5 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Active Sessions ({activeSessions.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Coffee className="h-3.5 w-3.5" />
          Café Orders Queue ({cafeOrders.filter(o => o.order_status !== 'SERVED').length})
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'shifts'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Shift Logs
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'leaves'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Time Off
        </button>
      </div>

      {/* Tab 1: Sessions */}
      {activeTab === 'sessions' && (
        <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
                <tr>
                  <th className="p-3.5">Station</th>
                  <th className="p-3.5">Player Details</th>
                  <th className="p-3.5">Zone & Tier</th>
                  <th className="p-3.5 font-mono text-right">Elapsed</th>
                  <th className="p-3.5 font-mono text-right">Rate / Hr</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F242C]">
                {activeSessions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#64748B]">
                      No active sessions running. Use 'Quick Seat Player' to assign a rig.
                    </td>
                  </tr>
                ) : (
                  activeSessions.map(sess => (
                    <tr key={sess.session_id} className="hover:bg-[#1A1E26] transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-cyan-400">{sess.station_code}</div>
                        <span className="text-[10px] text-[#64748B]">#{sess.session_id}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{sess.full_name}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">@{sess.username}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white">{sess.location_zone}</div>
                        <div className="text-[10px] text-blue-400 font-mono">{sess.tier_name || 'Standard'}</div>
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right font-medium text-cyan-300">
                        {sess.elapsed_minutes || 0} min
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-white">
                        ₹{parseFloat(sess.hourly_rate_applied).toFixed(0)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleCheckout(sess.session_id)}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors border border-[#3B82F6]/30"
                        >
                          Checkout
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {cafeOrders.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] rounded-xl border border-[#22262E] bg-[#14171C] text-xs">
              No café orders currently in queue.
            </div>
          ) : (
            cafeOrders.map(order => (
              <div
                key={order.order_id}
                className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">#{order.order_id}</span>
                    <StatusBadge status={order.order_status} size="xs" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1E24] text-cyan-400 border border-[#272D37]">
                      {order.station_code ? `Station ${order.station_code}` : 'Counter Pickup'}
                    </span>
                  </div>

                  <div className="text-xs text-white mt-1 font-medium">
                    {order.full_name} <span className="text-[#94A3B8] font-mono text-[10px]">(@{order.username})</span>
                  </div>

                  {order.delivery_note && (
                    <div className="text-xs text-[#94A3B8] italic mt-0.5">
                      "{order.delivery_note}"
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="mt-2 text-xs text-[#94A3B8] flex flex-wrap gap-1.5 font-mono">
                      {order.items.map(it => (
                        <span key={it.order_item_id || it.item_id} className="px-2 py-0.5 rounded bg-[#0D0F12] border border-[#1F242C]">
                          {it.name} <span className="text-white">x{it.quantity}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono tabular-nums text-sm font-bold text-amber-400">
                    ₹{parseFloat(order.total_amount).toFixed(0)}
                  </div>

                  {order.order_status === 'PLACED' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.order_id, 'PREPARING')}
                      className="px-3 py-1.5 rounded-lg bg-[#1A1E24] hover:bg-[#20252D] border border-[#272D37] hover:border-[#374151] text-xs font-medium text-white transition-all"
                    >
                      Start Prep
                    </button>
                  )}

                  {order.order_status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.order_id, 'SERVED')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors flex items-center gap-1 border border-[#3B82F6]/30"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Mark Served
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Shifts */}
      {activeTab === 'shifts' && (
        <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
              <tr>
                <th className="p-3.5">Shift ID</th>
                <th className="p-3.5">Scheduled Window</th>
                <th className="p-3.5">Punctuality</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F242C]">
              {shifts.map(shift => (
                <tr key={shift.shift_id} className="hover:bg-[#1A1E26] transition-colors">
                  <td className="p-3.5 font-mono text-white">#{shift.shift_id}</td>
                  <td className="p-3.5 text-[#94A3B8] font-mono">
                    {new Date(shift.scheduled_start).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3.5">
                    {shift.late_minutes > 0 ? (
                      <span className="text-amber-400 font-mono">{shift.late_minutes}m Late</span>
                    ) : (
                      <span className="text-emerald-400 font-mono">On Time</span>
                    )}
                  </td>
                  <td className="p-3.5"><StatusBadge status={shift.status} size="xs" /></td>
                  <td className="p-3.5 text-[#94A3B8]">{shift.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Leaves */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors flex items-center gap-1.5 border border-[#3B82F6]/30 active:scale-[0.99]"
            >
              <Plus className="h-3.5 w-3.5" /> Request Leave
            </button>
          </div>

          <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Dates</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F242C]">
                {leaves.map(l => (
                  <tr key={l.leave_id} className="hover:bg-[#1A1E26] transition-colors">
                    <td className="p-3.5 font-mono text-white">#{l.leave_id}</td>
                    <td className="p-3.5 font-medium text-blue-400">{l.leave_type}</td>
                    <td className="p-3.5 text-[#94A3B8] font-mono">{l.start_date} to {l.end_date}</td>
                    <td className="p-3.5 text-white">{l.reason}</td>
                    <td className="p-3.5"><StatusBadge status={l.status} size="xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seat Player Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-sm rounded-xl bg-[#14171C] border border-[#272D37] p-5 shadow-2xl">
            <button
              onClick={() => setShowCheckinModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-[#94A3B8] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-semibold text-white mb-3">Seat Player on Battle Rig</h3>
            <form onSubmit={handleQuickCheckin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  Available Battle Rig
                </label>
                <select
                  value={checkinStationId}
                  onChange={e => setCheckinStationId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                >
                  <option value="">-- Choose Rig --</option>
                  {stations.filter(s => s.status === 'AVAILABLE').map(st => (
                    <option key={st.station_id} value={st.station_id}>
                      {st.station_code} - {st.station_name || st.featured_game || st.category_name} (₹{st.base_hourly_rate}/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  Registered Player Account
                </label>
                <select
                  value={checkinUserId}
                  onChange={e => setCheckinUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                >
                  <option value="">-- Choose Player --</option>
                  <option value="5">Aarav Sharma (@aarav_sharma - Vortex VIP)</option>
                  <option value="6">Rohan Verma (@rohan_verma - Gold Pro)</option>
                  <option value="7">Devansh Patel (@dev_patel - Gold Pro)</option>
                  <option value="8">Priya Sen (@priya_sen - Silver Gamer)</option>
                  <option value="9">Rithvik Nair (@rithvik_n - Standard)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors border border-[#3B82F6]/30 active:scale-[0.99]"
              >
                Launch Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-sm rounded-xl bg-[#14171C] border border-[#272D37] p-5 shadow-2xl">
            <button
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-[#94A3B8] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-semibold text-white mb-3">Request Shift Leave</h3>
            <form onSubmit={handleSubmitLeave} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">Leave Classification</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                >
                  <option value="VACATION">Vacation / Paid Time Off</option>
                  <option value="SICK">Medical / Sick Leave</option>
                  <option value="PERSONAL">Personal / Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={e => setLeaveStart(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={e => setLeaveEnd(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">Reason</label>
                <textarea
                  rows="2"
                  required
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="Reason for Lounge General Manager review..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors border border-[#3B82F6]/30 active:scale-[0.99]"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
