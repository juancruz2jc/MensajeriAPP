import oracledb from 'oracledb';
import 'dotenv/config';

async function initialize() {
  await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1
  });
}

async function close() {
  await oracledb.getPool().close();
}

export { initialize, close };
