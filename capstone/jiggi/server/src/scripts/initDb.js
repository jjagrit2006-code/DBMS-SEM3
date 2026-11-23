const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runSqlFile(connection, filePath) {
  console.log(`[INIT] Reading ${path.basename(filePath)}...`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Parse multi-statement SQL respecting DELIMITER //
  const statements = [];
  let currentDelimiter = ';';
  let buffer = '';

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();

    // Check delimiter change
    if (trimmed.toUpperCase().startsWith('DELIMITER')) {
      const parts = trimmed.split(/\s+/);
      if (parts[1]) {
        currentDelimiter = parts[1];
      }
      continue;
    }

    // Ignore comment lines if buffer is empty
    if (buffer.trim() === '' && (trimmed.startsWith('--') || trimmed.startsWith('/*'))) {
      continue;
    }

    buffer += line + '\n';

    if (currentDelimiter === ';') {
      if (trimmed.endsWith(';')) {
        statements.push(buffer.trim());
        buffer = '';
      }
    } else {
      if (trimmed.endsWith(currentDelimiter)) {
        let clean = buffer.trim();
        clean = clean.substring(0, clean.length - currentDelimiter.length).trim();
        statements.push(clean);
        buffer = '';
      }
    }
  }

  if (buffer.trim()) {
    statements.push(buffer.trim());
  }

  console.log(`[INIT] Executing ${statements.length} statements from ${path.basename(filePath)}...`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    try {
      await connection.query(stmt);
    } catch (err) {
      console.error(`[INIT ERROR] in ${path.basename(filePath)} statement #${i + 1}:`);
      console.error(stmt.substring(0, 140) + '...');
      console.error('Error message:', err.message);
      throw err;
    }
  }
  console.log(`[INIT] Finished ${path.basename(filePath)} successfully.`);
}

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log(`[INIT] Connecting to MySQL server on ${host}:${port} as '${user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
  } catch (err) {
    console.error('[INIT FAILED] Could not connect to MySQL server:', err.message);
    console.error('Please make sure MySQL Server 8.0+ is running on port ' + port);
    process.exit(1);
  }

  try {
    const dbDir = path.join(__dirname, '../../../database');
    const files = [
      path.join(dbDir, '01_schema.sql'),
      path.join(dbDir, '02_routines_triggers.sql'),
      path.join(dbDir, '03_reports_views.sql'),
      path.join(dbDir, '04_seed.sql')
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        await runSqlFile(connection, file);
      } else {
        console.warn(`[INIT] Warning: file not found: ${file}`);
      }
    }

    console.log('\n======================================================');
    console.log(' VORTEX LOUNGE DATABASE SETUP COMPLETED SUCCESSFULLY! ');
    console.log(' All tables, routines, views, and seed data imported.');
    console.log('======================================================\n');
  } catch (err) {
    console.error('[INIT ERROR]', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

main();
