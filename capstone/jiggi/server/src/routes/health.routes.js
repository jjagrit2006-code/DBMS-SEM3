const express = require('express');
const router = express.Router();
const { isLive, getPool, dbConfig } = require('../config/db');

router.get('/', async (req, res) => {
  const isConnected = isLive();
  let dbStats = {
    connected: isConnected,
    mode: isConnected ? 'LIVE_MYSQL_POOL' : 'STANDBY_INTEGRATED_MODE',
    database: dbConfig.database,
    host: dbConfig.host,
    port: dbConfig.port,
    timestamp: new Date().toISOString()
  };

  if (isConnected) {
    try {
      const pool = getPool();
      const [tableRows] = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [dbConfig.database]);
      
      dbStats.tablesCount = tableRows.length;
      dbStats.tables = tableRows.map(r => r.TABLE_NAME || r.table_name);
    } catch (err) {
      dbStats.queryError = err.message;
    }
  } else {
    dbStats.info = 'To connect directly to live MySQL 8.0, run the database scripts in MySQL Workbench and start MySQL service on port 3306.';
  }

  res.json({
    status: 'ONLINE',
    service: 'Vortex Lounge Backend API',
    version: '1.0.0',
    database: dbStats
  });
});

module.exports = router;
