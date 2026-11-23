import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService, payrollService, staffService, stationService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Gamepad2, 
  Clock, 
  Plus, 
  Calculator, 
  Coffee,
  Trophy,
  Activity,
  X
} from 'lucide-react';

export default function AdminManager() {
  const { currentUser, showToast } = useAuth();
  const [activeSection, setActiveSection] = useState('bi-reports');
  const [reportType, setReportType] = useState('utilization');

  const [summary, setSummary] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [staffRoster, setStaffRoster] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payroll Form
  const [payPeriodStart, setPayPeriodStart] = useState('2026-11-01');
  const [payPeriodEnd, setPayPeriodEnd] = useState('2026-11-15');
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);

  // New Station Form
  const [showAddStation, setShowAddStation] = useState(false);
  const [newStationCode, setNewStationCode] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('1');
  const [newZone, setNewZone] = useState('Pro Arena');

  const loadSummary = async () => {
    try {
      const res = await reportService.getSummary();
      setSummary(res.data.summary);
    } catch (err) {
      console.warn('Could not load summary:', err.message);
    }
  };

  const loadReport = async (type) => {
    try {
      setLoading(true);
      let res;
      if (type === 'utilization') res = await reportService.getUtilization();
      else if (type === 'revenue') res = await reportService.getRevenue();
      else if (type === 'peak-hours') res = await reportService.getPeakHours();
      else if (type === 'cafe') res = await reportService.getCafe();
      else if (type === 'staff') res = await reportService.getStaff();
      else if (type === 'leaderboard') res = await reportService.getLeaderboard();

      setReportData(res?.data?.report || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPayroll = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        payrollService.getPayroll(),
        staffService.getRoster()
      ]);
      setPayrollRecords(pRes.data.payroll || []);
      setStaffRoster(rRes.data.staff || []);
    } catch (err) {
      console.warn('Could not load payroll:', err.message);
    }
  };

  const loadFleet = async () => {
    try {
      const res = await stationService.getStations();
      setStations(res.data.stations || []);
    } catch (err) {
      console.warn('Could not load fleet:', err.message);
    }
  };

  useEffect(() => {
    loadSummary();
    if (activeSection === 'bi-reports') loadReport(reportType);
    if (activeSection === 'payroll') loadPayroll();
    if (activeSection === 'fleet') loadFleet();
  }, [activeSection, reportType]);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setIsGeneratingPayroll(true);
    try {
      const res = await payrollService.generatePayroll({
        start_date: payPeriodStart,
        end_date: payPeriodEnd
      });
      showToast(res.data.message || 'Payroll generated successfully!', 'success');
      await loadPayroll();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setIsGeneratingPayroll(false);
    }
  };

  const handleDisbursePayroll = async (payrollId) => {
    try {
      await payrollService.disburse(payrollId);
      showToast(`Payroll #${payrollId} marked as disbursed!`, 'success');
      await loadPayroll();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      await stationService.addStation({
        station_code: newStationCode,
        category_id: parseInt(newCategoryId, 10),
        location_zone: newZone
      });
      showToast(`Battle Rig ${newStationCode} added to lounge fleet!`, 'success');
      setShowAddStation(false);
      setNewStationCode('');
      await loadFleet();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              General Manager Executive Hub
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A1E24] text-[#94A3B8] border border-[#272D37]">
              BI Analytics & Controls
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Lounge Intelligence, Payroll & Fleet Hub
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Complex Analytical SQL Views • Automated Payroll Engine • Real-Time Hardware Inventory
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121519] border border-[#1F242C]">
          <button
            onClick={() => setActiveSection('bi-reports')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeSection === 'bi-reports'
                ? 'bg-[#2563EB] text-white font-medium border border-[#3B82F6]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Performance BI
          </button>

          <button
            onClick={() => setActiveSection('payroll')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeSection === 'payroll'
                ? 'bg-[#2563EB] text-white font-medium border border-[#3B82F6]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            Staff & Payroll
          </button>

          <button
            onClick={() => setActiveSection('fleet')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeSection === 'fleet'
                ? 'bg-[#2563EB] text-white font-medium border border-[#3B82F6]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            Rig Fleet
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Floor Occupancy</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-cyan-400 mt-1">
            {summary?.activeFloorUtilizationPercent || 25}%
          </div>
          <span className="text-[10px] text-[#64748B]">
            {summary?.occupiedCount || 4} of {summary?.totalStationsCount || 16} Rigs
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Gross Daily Revenue</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-400 mt-1">
            ₹{(summary?.todayGrossRevenue || 28450).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#64748B]">Gaming + Café orders</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Supervisors On Duty</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-white mt-1">
            {summary?.onDutyStaffCount || 1}
          </div>
          <span className="text-[10px] text-[#64748B]">Shift actively clocked</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#2E3642] transition-all">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Kitchen Pipeline</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-400 mt-1">
            {summary?.pendingCafeOrdersCount || 2}
          </div>
          <span className="text-[10px] text-[#64748B]">Pending orders in kitchen</span>
        </div>
      </div>

      {/* SECTION 1: Business Intelligence Reports */}
      {activeSection === 'bi-reports' && (
        <div className="space-y-5">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-[#1F242C]">
            {[
              { id: 'utilization', label: 'Station Utilization', icon: Gamepad2 },
              { id: 'revenue', label: 'Daily Revenue Breakdown', icon: TrendingUp },
              { id: 'peak-hours', label: 'Peak Gaming Demand', icon: Clock },
              { id: 'cafe', label: 'Café Sales & Margins', icon: Coffee },
              { id: 'staff', label: 'Staff Attendance & Wages', icon: Users },
              { id: 'leaderboard', label: 'Player Loyalty Leaderboard', icon: Trophy }
            ].map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setReportType(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    reportType === r.id
                      ? 'bg-[#2563EB]/15 text-blue-400 border border-[#2563EB]/30 font-medium'
                      : 'bg-[#14171C] text-[#94A3B8] hover:text-white border border-[#22262E]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#1F242C] flex items-center justify-between bg-[#121519]">
              <div>
                <h3 className="text-xs font-semibold text-white capitalize">
                  {reportType.replace('-', ' ')} Analysis
                </h3>
                <p className="text-[10px] text-[#94A3B8] font-mono">
                  Backed by live SQL view
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#64748B]">
                {reportData.length} records returned
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-14 text-center text-[#64748B] text-xs font-mono">
                  Executing database SQL query...
                </div>
              ) : reportData.length === 0 ? (
                <div className="py-14 text-center text-[#64748B] text-xs font-mono">
                  No data points recorded for this view.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
                    <tr>
                      {Object.keys(reportData[0]).map(key => (
                        <th key={key} className="p-3.5 whitespace-nowrap">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F242C]">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#1A1E26] transition-colors">
                        {Object.entries(row).map(([k, val], cellIdx) => (
                          <td key={cellIdx} className="p-3.5 text-white whitespace-nowrap font-mono tabular-nums">
                            {typeof val === 'number'
                              ? (k.includes('revenue') || k.includes('cost') || k.includes('price') || k.includes('wages') || k.includes('profit') || k.includes('spend') || k.includes('balance') || k.includes('rate')
                                ? `₹${val.toLocaleString('en-IN')}`
                                : (k.includes('percentage') || k.includes('percent') ? `${val}%` : val))
                              : (val || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Staff & Payroll */}
      {activeSection === 'payroll' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#22262E] bg-[#14171C] p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  Automated Payroll Stored Procedure
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Calculate Pay Period Wages
                </h3>
                <p className="text-xs text-[#94A3B8] max-w-xl mt-1 leading-relaxed">
                  Executes `sp_generate_staff_payroll`: aggregates completed shifts, partitions regular vs 1.5x overtime hours, and creates auditable pay slips in ₹.
                </p>
              </div>

              <form onSubmit={handleGeneratePayroll} className="flex flex-wrap items-center gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-[#94A3B8] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={payPeriodStart}
                    onChange={e => setPayPeriodStart(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#94A3B8] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={payPeriodEnd}
                    onChange={e => setPayPeriodEnd(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isGeneratingPayroll}
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors flex items-center gap-1.5 border border-[#3B82F6]/30 active:scale-[0.99]"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    {isGeneratingPayroll ? 'Executing Procedure...' : 'Run Payroll'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#1F242C] flex items-center justify-between bg-[#121519]">
              <h3 className="text-xs font-semibold text-white">Staff Pay Slips & Disbursements</h3>
              <span className="text-[11px] text-[#94A3B8] font-mono">1.5x Overtime Rate Factor</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Period</th>
                    <th className="p-3.5 font-mono text-right">Regular</th>
                    <th className="p-3.5 font-mono text-right">Overtime</th>
                    <th className="p-3.5 font-mono text-right">Base Wage</th>
                    <th className="p-3.5 font-mono text-right">Net Pay</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F242C]">
                  {payrollRecords.map(rec => (
                    <tr key={rec.payroll_id} className="hover:bg-[#1A1E26] transition-colors">
                      <td className="p-3.5 font-mono text-white">#{rec.payroll_id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{rec.full_name}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{rec.job_title} • ₹{rec.hourly_rate}/hr</div>
                      </td>
                      <td className="p-3.5 text-[#94A3B8] font-mono text-[11px]">
                        {rec.pay_period_start} → {rec.pay_period_end}
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-[#94A3B8]">
                        {parseFloat(rec.regular_hours).toFixed(1)}h
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-cyan-400">
                        {parseFloat(rec.overtime_hours) > 0 ? `${parseFloat(rec.overtime_hours).toFixed(1)}h` : '—'}
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right text-[#94A3B8]">
                        ₹{parseFloat(rec.base_pay).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-right font-bold text-emerald-400">
                        ₹{parseFloat(rec.net_pay).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5"><StatusBadge status={rec.payment_status} size="xs" /></td>
                      <td className="p-3.5 text-right">
                        {rec.payment_status === 'APPROVED' ? (
                          <button
                            onClick={() => handleDisbursePayroll(rec.payroll_id)}
                            className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
                          >
                            Disburse
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#64748B] font-mono">Disbursed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Roster */}
          <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#1F242C] flex items-center justify-between bg-[#121519]">
              <h3 className="text-xs font-semibold text-white">Staff Personnel Roster</h3>
              <span className="text-[11px] text-[#94A3B8] font-mono">{staffRoster.length} active personnel</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 font-mono text-right">Hourly Rate</th>
                  <th className="p-3.5">Hire Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F242C]">
                {staffRoster.map(s => (
                  <tr key={s.user_id} className="hover:bg-[#1A1E26] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{s.full_name}</div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">{s.email}</div>
                    </td>
                    <td className="p-3.5 text-white">{s.job_title}</td>
                    <td className="p-3.5 font-mono tabular-nums text-right text-blue-400 font-medium">
                      ₹{parseFloat(s.hourly_wage).toFixed(0)}/hr
                    </td>
                    <td className="p-3.5 text-[#94A3B8] font-mono">{s.hire_date}</td>
                    <td className="p-3.5"><StatusBadge status={s.staff_status || 'ACTIVE'} size="xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Station Fleet CRUD */}
      {activeSection === 'fleet' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Hardware Rig Fleet Inventory</h3>
              <p className="text-xs text-[#94A3B8]">Configure stations, hardware categories, and maintenance status</p>
            </div>
            <button
              onClick={() => setShowAddStation(true)}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors flex items-center gap-1.5 border border-[#3B82F6]/30 active:scale-[0.99]"
            >
              <Plus className="h-3.5 w-3.5" /> Add Station Rig
            </button>
          </div>

          <div className="rounded-xl border border-[#22262E] bg-[#14171C] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1116] text-[#64748B] uppercase text-[10px] font-mono tracking-wider border-b border-[#1F242C]">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Zone</th>
                  <th className="p-3.5 font-mono text-right">Base Rate</th>
                  <th className="p-3.5 font-mono">IP Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F242C]">
                {stations.map(st => (
                  <tr key={st.station_id} className="hover:bg-[#1A1E26] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{st.station_code}</td>
                    <td className="p-3.5 text-white">{st.category_name}</td>
                    <td className="p-3.5 text-[#94A3B8]">{st.location_zone}</td>
                    <td className="p-3.5 font-mono tabular-nums text-right text-white">
                      ₹{parseFloat(st.base_hourly_rate).toFixed(0)}/hr
                    </td>
                    <td className="p-3.5 font-mono text-[#64748B]">{st.mac_ip_address}</td>
                    <td className="p-3.5"><StatusBadge status={st.status} size="xs" /></td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={async () => {
                          const newStatus = st.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
                          await stationService.updateStatus(st.station_id, { status: newStatus });
                          showToast(`${st.station_code} set to ${newStatus}`, 'info');
                          loadFleet();
                        }}
                        className="text-cyan-400 hover:text-blue-400 text-xs font-medium transition-colors"
                      >
                        {st.status === 'MAINTENANCE' ? 'Set Available' : 'Set Maintenance'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Station Modal */}
          {showAddStation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="relative w-full max-w-sm rounded-xl bg-[#14171C] border border-[#272D37] p-5 shadow-2xl">
                <button
                  onClick={() => setShowAddStation(false)}
                  className="absolute top-4 right-4 p-1 rounded-md text-[#94A3B8] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-white mb-3">Add Rig to Fleet</h3>
                <form onSubmit={handleAddStation} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">Station Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PC-07, VIP-05, SIM-03"
                      value={newStationCode}
                      onChange={e => setNewStationCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">Hardware Tier Category</label>
                    <select
                      value={newCategoryId}
                      onChange={e => setNewCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                    >
                      <option value="1">Esports Pro Arena (₹180/hr)</option>
                      <option value="2">VIP Elite Liquid Pod (₹280/hr)</option>
                      <option value="3">Console Lounge Bay (₹150/hr)</option>
                      <option value="4">Sim Racing Motion Pit (₹350/hr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">Location Zone</label>
                    <select
                      value={newZone}
                      onChange={e => setNewZone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-xs text-white focus:border-blue-500"
                    >
                      <option value="Pro Arena">Pro Arena</option>
                      <option value="VIP Elite Stage">VIP Elite Stage</option>
                      <option value="Console Bay">Console Bay</option>
                      <option value="Sim Racing Pit">Sim Racing Pit</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStation(false)}
                      className="flex-1 py-2 rounded-lg bg-[#1A1E24] hover:bg-[#20252D] border border-[#272D37] text-[#94A3B8] hover:text-white text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors border border-[#3B82F6]/30"
                    >
                      Create Rig
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
