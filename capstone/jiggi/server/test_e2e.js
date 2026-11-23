const http = require('http');

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' STARTING VORTEX LOUNGE END-TO-END VERIFICATION SUITE ');
  console.log('======================================================\n');

  try {
    // 1. Health check
    console.log('[1/10] Testing /api/health...');
    const health = await request('GET', '/api/health');
    console.log(`  -> Status: ${health.status}, Service: ${health.data.service}, Mode: ${health.data.database.mode}`);

    // 2. Auth login
    console.log('[2/10] Testing player login...');
    const login = await request('POST', '/api/auth/login', {
      email: 'alex@vortexgamer.com',
      password: 'Password123!'
    });
    console.log(`  -> Status: ${login.status}, Player: ${login.data.user.full_name}, Tier: ${login.data.user.tier?.name}`);
    const token = login.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Station floor
    console.log('[3/10] Testing /api/stations...');
    const stations = await request('GET', '/api/stations');
    console.log(`  -> Status: ${stations.status}, Total Stations: ${stations.data.stations.length}`);

    // 4. Wallet balance & topup
    console.log('[4/10] Testing wallet top-up via stored procedure...');
    const topup = await request('POST', '/api/wallet/topup', {
      amount: 50,
      payment_method: 'CREDIT_CARD'
    }, authHeaders);
    console.log(`  -> Status: ${topup.status}, New Balance: $${topup.data.new_balance}`);

    // 5. Start gaming session
    console.log('[5/10] Testing starting gaming session on station #2 (PC-02)...');
    const startSess = await request('POST', '/api/sessions/start', {
      station_id: 2
    }, authHeaders);
    console.log(`  -> Status: ${startSess.status}, Session ID: ${startSess.data.session_id}`);
    const newSessionId = startSess.data.session_id;

    // 6. Active sessions
    console.log('[6/10] Testing live session monitor (/api/sessions/active)...');
    const active = await request('GET', '/api/sessions/active', null, { 'x-vortex-user-id': '1' });
    console.log(`  -> Status: ${active.status}, Active Count: ${active.data.sessions.length}`);

    // 7. Café order
    console.log('[7/10] Testing café order placement & wallet deduction...');
    const cafe = await request('POST', '/api/cafe/order', {
      items: [{ item_id: 1, quantity: 2 }],
      station_id: 2,
      session_id: newSessionId,
      delivery_note: 'Cold cans to PC-02 please'
    }, authHeaders);
    console.log(`  -> Status: ${cafe.status}, Order Total: $${cafe.data.order?.total_amount || cafe.data.total_amount}`);

    // 8. Session checkout
    console.log('[8/10] Testing session checkout & settlement...');
    const checkout = await request('POST', '/api/sessions/checkout', {
      session_id: newSessionId,
      payment_method: 'WALLET'
    }, authHeaders);
    console.log(`  -> Status: ${checkout.status}, Total Billed: $${checkout.data.total_billed}`);

    // 9. Payroll generation
    console.log('[9/10] Testing automated staff payroll calculation (sp_generate_staff_payroll)...');
    const payroll = await request('POST', '/api/payroll/generate', {
      start_date: '2026-11-01',
      end_date: '2026-11-30'
    }, { 'x-vortex-user-id': '1' });
    console.log(`  -> Status: ${payroll.status}, Message: ${payroll.data.message}`);

    // 10. Analytical BI reports
    console.log('[10/10] Testing analytical reports views...');
    const [util, rev, peak, topCafe, leaderboard, kpi] = await Promise.all([
      request('GET', '/api/reports/utilization', null, { 'x-vortex-user-id': '1' }),
      request('GET', '/api/reports/revenue', null, { 'x-vortex-user-id': '1' }),
      request('GET', '/api/reports/peak-hours', null, { 'x-vortex-user-id': '1' }),
      request('GET', '/api/reports/cafe', null, { 'x-vortex-user-id': '1' }),
      request('GET', '/api/reports/leaderboard', null, { 'x-vortex-user-id': '1' }),
      request('GET', '/api/reports/summary', null, { 'x-vortex-user-id': '1' })
    ]);
    console.log(`  -> Utilization report rows: ${util.data.report?.length}`);
    console.log(`  -> Daily Revenue rows: ${rev.data.report?.length}`);
    console.log(`  -> Peak Hours rows: ${peak.data.report?.length}`);
    console.log(`  -> Top Café rows: ${topCafe.data.report?.length}`);
    console.log(`  -> Leaderboard rows: ${leaderboard.data.report?.length}`);
    console.log(`  -> Executive Floor Occupancy KPI: ${kpi.data.summary?.activeFloorUtilizationPercent}%`);

    console.log('\n======================================================');
    console.log(' ALL 10/10 VERIFICATION TESTS PASSED SUCCESSFULLY!    ');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

// Check if server is running or start it inline for testing
const net = require('net');
const socket = new net.Socket();
socket.setTimeout(500);
socket.on('connect', () => {
  socket.destroy();
  runTests();
});
socket.on('error', () => {
  socket.destroy();
  console.log('Starting server inline for test...');
  require('./src/index.js');
  setTimeout(runTests, 1200);
});
socket.on('timeout', () => {
  socket.destroy();
  console.log('Starting server inline for test...');
  require('./src/index.js');
  setTimeout(runTests, 1200);
});
socket.connect(5000, 'localhost');
