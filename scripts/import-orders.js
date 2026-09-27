const fs = require('fs');
const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));

function loadEnv() {
  const text = fs.readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) {
      env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const dumpPath = path.join(__dirname, '..', 'dumps', 'orders.sql');
  const sql = fs.readFileSync(dumpPath, 'utf8');
  const ssl = env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  console.log('Connecting to', env.MYSQL_HOST, 'as', env.MYSQL_USER);

  const conn = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT || 3306),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    multipleStatements: true,
    ssl,
  });

  const [dbs] = await conn.query('SHOW DATABASES');
  const names = dbs.map((d) => d.Database).filter((n) => !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(n));
  console.log('Databases this user can open:', names.join(', ') || '(none)');

  if (!names.includes(env.MYSQL_DB)) {
    throw new Error(
      'MYSQL_DB=' + env.MYSQL_DB + ' is not allowed for this user. Put one of these into MYSQL_DB: ' + names.join(', '),
    );
  }

  await conn.query('USE `' + env.MYSQL_DB + '`');
  await conn.query(sql);
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM orders');
  await conn.end();
  console.log('Done. Orders in DB:', rows[0].n);
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
