import axios from 'axios';
import {
  MOCK_CATEGORIES,
  MOCK_STATIONS,
  MOCK_GAMES,
  MOCK_CAFE_CATEGORIES,
  MOCK_CAFE_ITEMS,
  MOCK_DEMO_USERS,
  MOCK_ACTIVE_SESSION,
  MOCK_SUMMARY,
  getStoredBalance,
  getStoredTransactions
} from './mockData';

const api = axios.create({
  baseURL: '/api',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Token or active demo user header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vortex_token');
  const activeUser = localStorage.getItem('vortex_active_user');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (activeUser) {
    try {
      const parsed = JSON.parse(activeUser);
      if (parsed.user_id) {
        config.headers['x-vortex-user-id'] = parsed.user_id;
      } else {
        config.headers['x-vortex-user-id'] = 5;
      }
    } catch (e) {
      config.headers['x-vortex-user-id'] = 5;
    }
  } else {
    config.headers['x-vortex-user-id'] = 5;
  }
  return config;
});

// Helper to wrap fallback data in standard Axios-like response format
const fallback = (data) => Promise.resolve({ data });

export const authService = {
  login: credentials => api.post('/auth/login', credentials).catch(() => fallback({ user: MOCK_DEMO_USERS[0], token: 'demo-token' })),
  register: data => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me').catch(() => fallback({ user: MOCK_DEMO_USERS[0] })),
  getDemoUsers: () => api.get('/auth/demo-users').catch(() => fallback({ accounts: MOCK_DEMO_USERS }))
};

export const stationService = {
  getStations: () => api.get('/stations').catch(() => fallback({ stations: MOCK_STATIONS })),
  getCategories: () => api.get('/stations/categories').catch(() => fallback({ categories: MOCK_CATEGORIES })),
  getGames: () => api.get('/stations/games').catch(() => fallback({ games: MOCK_GAMES })),
  updateStatus: (stationId, data) => api.patch(`/stations/${stationId}/status`, data).catch(() => fallback({ success: true })),
  addStation: data => api.post('/stations', data).catch(() => fallback({ success: true, station: data }))
};

export const sessionService = {
  getActive: () => api.get('/sessions/active').catch(() => fallback({ sessions: [MOCK_ACTIVE_SESSION] })),
  getMy: () => api.get('/sessions/my').catch(() => fallback({
    activeSession: MOCK_ACTIVE_SESSION,
    history: [
      {
        session_id: 101,
        station_code: 'VIP-01',
        location_zone: 'VIP Elite Stage',
        duration_minutes: 120,
        subtotal_amount: 560.00,
        discount_amount: 140.00,
        total_amount: 420.00,
        payment_status: 'PAID_WALLET',
        status: 'COMPLETED'
      },
      {
        session_id: 102,
        station_code: 'PC-01',
        location_zone: 'Pro Arena',
        duration_minutes: 120,
        subtotal_amount: 360.00,
        discount_amount: 54.00,
        total_amount: 306.00,
        payment_status: 'PAID_WALLET',
        status: 'COMPLETED'
      },
      {
        session_id: 103,
        station_code: 'SIM-01',
        location_zone: 'Sim Racing Pit',
        duration_minutes: 90,
        subtotal_amount: 525.00,
        discount_amount: 78.75,
        total_amount: 446.25,
        payment_status: 'PAID_WALLET',
        status: 'COMPLETED'
      }
    ]
  })),
  startSession: data => api.post('/sessions/start', data).catch(() => fallback({ session_id: 201 })),
  checkoutSession: data => api.post('/sessions/checkout', data).catch(() => fallback({ total_billed: 252.00 }))
};

export const bookingService = {
  getBookings: () => api.get('/bookings').catch(() => fallback({ bookings: [] })),
  createBooking: data => api.post('/bookings', data).catch(() => fallback({ success: true })),
  checkIn: bookingId => api.patch(`/bookings/${bookingId}/checkin`).catch(() => fallback({ success: true }))
};

export const walletService = {
  getWallet: userId => api.get(`/wallet${userId ? `?user_id=${userId}` : ''}`).then(res => {
    if (res.data?.wallet?.balance !== undefined) {
      localStorage.setItem('vortex_wallet_balance', res.data.wallet.balance.toString());
      if (res.data?.transactions) {
        localStorage.setItem('vortex_wallet_transactions', JSON.stringify(res.data.transactions));
      }
    }
    return res;
  }).catch(() => fallback({
    wallet: { balance: getStoredBalance(), currency: 'INR' },
    transactions: getStoredTransactions()
  })),
  topup: data => api.post('/wallet/topup', data).then(res => {
    if (res.data?.new_balance !== undefined) {
      localStorage.setItem('vortex_wallet_balance', res.data.new_balance.toString());
    }
    return res;
  }).catch(() => {
    const amt = parseFloat(data.amount || 0);
    const newBal = getStoredBalance() + amt;
    localStorage.setItem('vortex_wallet_balance', newBal.toString());
    return fallback({ new_balance: newBal, success: true });
  })
};

export const cafeService = {
  getMenu: () => api.get('/cafe/menu').catch(() => fallback({
    categories: MOCK_CAFE_CATEGORIES,
    items: MOCK_CAFE_ITEMS
  })),
  placeOrder: data => api.post('/cafe/order', data).catch(() => fallback({ order_id: 204 })),
  getOrders: () => api.get('/cafe/orders').catch(() => fallback({
    orders: [
      {
        order_id: 201,
        full_name: 'Aarav Sharma',
        username: 'aarav_sharma',
        station_code: 'VIP-01',
        order_status: 'PREPARING',
        total_amount: 500.00,
        delivery_note: 'Station VIP-01: Extra spicy dip for tenders',
        items: [{ item_id: 9, name: 'Crispy Korean BBQ Chicken Tenders', quantity: 1 }, { item_id: 3, name: 'Vortex Electric Blue Mojito', quantity: 1 }]
      },
      {
        order_id: 202,
        full_name: 'Rohan Verma',
        username: 'rohan_verma',
        station_code: 'PC-01',
        order_status: 'PLACED',
        total_amount: 260.00,
        delivery_note: 'Station PC-01: Cold drink right away please',
        items: [{ item_id: 11, name: 'Loaded Jalapeño Queso Nachos', quantity: 1 }]
      }
    ]
  })),
  updateStatus: (orderId, status) => api.patch(`/cafe/orders/${orderId}/status`, { status }).catch(() => fallback({ success: true })),
  updateStock: (itemId, stock_quantity) => api.patch(`/cafe/items/${itemId}/stock`, { stock_quantity }).catch(() => fallback({ success: true }))
};

export const staffService = {
  getRoster: () => api.get('/staff/roster').catch(() => fallback({
    staff: [
      { user_id: 2, full_name: 'Ananya Nair', email: 'ananya@vortexlounge.in', job_title: 'Lounge Shift Lead', hourly_wage: 250.00, hire_date: '2024-03-15', staff_status: 'ACTIVE' },
      { user_id: 3, full_name: 'Kabir Mehta', email: 'kabir@vortexlounge.in', job_title: 'Systems & Net Engineer', hourly_wage: 320.00, hire_date: '2024-01-10', staff_status: 'ACTIVE' },
      { user_id: 4, full_name: 'Pooja Roy', email: 'pooja@vortexlounge.in', job_title: 'Guest Experience Host', hourly_wage: 200.00, hire_date: '2024-06-01', staff_status: 'ACTIVE' }
    ]
  })),
  getShifts: staffId => api.get(`/staff/shifts${staffId ? `?staff_id=${staffId}` : ''}`).catch(() => fallback({
    shifts: [
      { shift_id: 1, scheduled_start: new Date(Date.now() - 374400000).toISOString(), late_minutes: 0, status: 'COMPLETED', notes: 'Opening shift inspection' },
      { shift_id: 2, scheduled_start: new Date(Date.now() - 345600000).toISOString(), late_minutes: 10, status: 'COMPLETED', notes: 'Replaced SSD on PC-05' },
      { shift_id: 6, scheduled_start: new Date(Date.now() - 10800000).toISOString(), late_minutes: 0, status: 'ON_DUTY', notes: 'Floor supervisor on duty' }
    ]
  })),
  timeclock: action => api.post('/staff/timeclock', { action }).catch(() => fallback({ message: `Timeclock: ${action} recorded.` })),
  getLeaves: staffId => api.get(`/staff/leaves${staffId ? `?staff_id=${staffId}` : ''}`).catch(() => fallback({
    leaves: [
      { leave_id: 1, leave_type: 'VACATION', start_date: '2026-12-24', end_date: '2026-12-28', reason: 'Family holiday trip', status: 'APPROVED' },
      { leave_id: 2, leave_type: 'PERSONAL', start_date: '2026-12-05', end_date: '2026-12-06', reason: 'Family function', status: 'PENDING' }
    ]
  })),
  submitLeave: data => api.post('/staff/leaves', data).catch(() => fallback({ success: true })),
  updateLeaveStatus: (leaveId, status) => api.patch(`/staff/leaves/${leaveId}/status`, { status }).catch(() => fallback({ success: true }))
};

export const payrollService = {
  getPayroll: staffId => api.get(`/payroll${staffId ? `?staff_id=${staffId}` : ''}`).catch(() => fallback({
    payroll: [
      { payroll_id: 1, full_name: 'Ananya Nair', job_title: 'Lounge Shift Lead', hourly_rate: 250.00, pay_period_start: '2026-11-01', pay_period_end: '2026-11-15', regular_hours: 80.00, overtime_hours: 6.50, base_pay: 20000.00, net_pay: 23937.50, payment_status: 'DISBURSED' },
      { payroll_id: 2, full_name: 'Kabir Mehta', job_title: 'Systems & Net Engineer', hourly_rate: 320.00, pay_period_start: '2026-11-01', pay_period_end: '2026-11-15', regular_hours: 76.00, overtime_hours: 0.00, base_pay: 24320.00, net_pay: 25320.00, payment_status: 'DISBURSED' },
      { payroll_id: 3, full_name: 'Pooja Roy', job_title: 'Guest Experience Host', hourly_rate: 200.00, pay_period_start: '2026-11-01', pay_period_end: '2026-11-15', regular_hours: 68.00, overtime_hours: 0.00, base_pay: 13600.00, net_pay: 14100.00, payment_status: 'DISBURSED' }
    ]
  })),
  generatePayroll: data => api.post('/payroll/generate', data).catch(() => fallback({ message: 'Payroll generated successfully!' })),
  disburse: payrollId => api.patch(`/payroll/${payrollId}/disburse`).catch(() => fallback({ success: true }))
};

export const reportService = {
  getUtilization: () => api.get('/reports/utilization').catch(() => fallback({
    report: [
      { station_code: 'PC-01', location_zone: 'Pro Arena', base_hourly_rate: 180, total_sessions: 24, total_runtime_hours: 48.5, gross_revenue: 8730, utilization_percentage: 67 },
      { station_code: 'VIP-01', location_zone: 'VIP Elite Stage', base_hourly_rate: 280, total_sessions: 19, total_runtime_hours: 42.0, gross_revenue: 11760, utilization_percentage: 58 },
      { station_code: 'SIM-01', location_zone: 'Sim Racing Pit', base_hourly_rate: 350, total_sessions: 28, total_runtime_hours: 56.0, gross_revenue: 19600, utilization_percentage: 78 },
      { station_code: 'PS5-01', location_zone: 'Console Bay', base_hourly_rate: 150, total_sessions: 32, total_runtime_hours: 64.0, gross_revenue: 9600, utilization_percentage: 89 }
    ]
  })),
  getRevenue: () => api.get('/reports/revenue').catch(() => fallback({
    report: [
      { report_date: '2026-11-19', gaming_revenue: 22450, cafe_revenue: 6000, gross_revenue: 28450, total_settled_orders: 14 },
      { report_date: '2026-11-18', gaming_revenue: 19800, cafe_revenue: 5200, gross_revenue: 25000, total_settled_orders: 12 },
      { report_date: '2026-11-17', gaming_revenue: 24100, cafe_revenue: 7100, gross_revenue: 31200, total_settled_orders: 18 }
    ]
  })),
  getPeakHours: () => api.get('/reports/peak-hours').catch(() => fallback({
    report: [
      { hour_of_day: 18, active_rigs: 14, revenue_generated: 4620 },
      { hour_of_day: 19, active_rigs: 16, revenue_generated: 5280 },
      { hour_of_day: 20, active_rigs: 16, revenue_generated: 5280 },
      { hour_of_day: 21, active_rigs: 15, revenue_generated: 4950 },
      { hour_of_day: 22, active_rigs: 13, revenue_generated: 4290 }
    ]
  })),
  getCafe: () => api.get('/reports/cafe').catch(() => fallback({
    report: [
      { item_name: 'Vortex Nitro Cold Brew', category: 'Coffee', units_sold: 45, total_revenue: 9450, gross_profit: 6075, margin_percent: 64 },
      { item_name: 'Crispy Korean BBQ Chicken Tenders', category: 'Hot Snacks', units_sold: 38, total_revenue: 11780, gross_profit: 6840, margin_percent: 58 },
      { item_name: 'Monster Ultra Peachy Keen', category: 'Energy Drinks', units_sold: 52, total_revenue: 8320, gross_profit: 3640, margin_percent: 43 }
    ]
  })),
  getStaff: () => api.get('/reports/staff').catch(() => fallback({
    report: [
      { staff_name: 'Ananya Nair', role: 'Lounge Shift Lead', shifts_logged: 10, total_hours: 80, on_time_rate_percent: 100, wages_earned: 20000 },
      { staff_name: 'Kabir Mehta', role: 'Systems & Net Engineer', shifts_logged: 9, total_hours: 76, on_time_rate_percent: 89, wages_earned: 24320 }
    ]
  })),
  getLeaderboard: () => api.get('/reports/leaderboard').catch(() => fallback({
    report: [
      { player_name: 'Aarav Sharma', username: 'aarav_sharma', tier: 'Vortex VIP', total_hours_played: 80, total_spend: 34500, loyalty_points: 3850 },
      { player_name: 'Rohan Verma', username: 'rohan_verma', tier: 'Gold Pro', total_hours_played: 41, total_spend: 18200, loyalty_points: 1920 },
      { player_name: 'Devansh Patel', username: 'dev_patel', tier: 'Gold Pro', total_hours_played: 33, total_spend: 14800, loyalty_points: 1640 }
    ]
  })),
  getSummary: () => api.get('/reports/summary').catch(() => fallback({ summary: MOCK_SUMMARY }))
};

export const healthService = {
  checkHealth: () => api.get('/health').catch(() => fallback({ status: 'STANDBY_MOCK' }))
};

export default api;
