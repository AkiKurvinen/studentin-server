import pg from 'pg';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
const pool = new pg.Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: process.env.DATABASE_URL ? true : false,
});
export default pool;
