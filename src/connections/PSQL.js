import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD } = process.env

const pool = new pg.Pool({
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
})

export default pool
