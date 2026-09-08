import pg from 'pg';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const pool = new pg.Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

// Test connection on init
pool.query('SELECT NOW()', [])
  .then(() => logger.info('Database connection successful'))
  .catch(err => logger.error('Database connection failed', err));

export default {
  /**
   * Execute any SQL query with parameters
   * @param {string} query - SQL query to execute
   * @param {Array} params - Parameters for the query
   * @returns {Promise<Object>} - Query result
   */
  query: async (query, params = []) => {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      logger.error(`Query failed: ${query}`, error);
      throw error;
    }
  },
  
  /**
   * Insert data into a table, replacing all existing data
   * @param {string} tableName - Name of the table
   * @param {string} insertQuery - The VALUES part of the INSERT query
   * @returns {Promise<void>}
   */
  replaceTableData: async (tableName, insertQuery) => {
    // DELETE + INSERT en una sola transaccion: si el INSERT falla, antes la
    // tabla quedaba VACIA en produccion (el DELETE ya habia commiteado).
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM ${tableName}`);
      await client.query(`INSERT INTO ${tableName} ${insertQuery}`);
      await client.query('COMMIT');
      logger.info(`Table ${tableName} updated successfully`);
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      logger.error(`Failed to update table ${tableName}`, error);
      throw error;
    } finally {
      client.release();
    }
  },
  
  /**
   * Reemplaza solo un subconjunto de filas: DELETE ... WHERE + INSERT, en una
   * sola transaccion.
   * @param {string} tableName
   * @param {string} whereClause - condicion del DELETE (sin la palabra WHERE)
   * @param {string} insertQuery - el INSERT completo
   */
  replaceTableRange: async (tableName, whereClause, insertQuery) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const del = await client.query(`DELETE FROM "${tableName}" WHERE ${whereClause}`);
      await client.query(insertQuery);
      await client.query('COMMIT');
      logger.info(`Table ${tableName}: ${del.rowCount} filas borradas y reemplazadas`);
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      logger.error(`Failed to replace range in ${tableName}`, error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get the latest date from a table
   * @param {string} tableName - Name of the table
   * @param {string} dateColumn - Name of the date column
   * @returns {Promise<Date>} - The latest date
   */
  getLatestDate: async (tableName, dateColumn) => {
    try {
      const result = await pool.query(`SELECT MAX(${dateColumn}) FROM "${tableName}"`);
      return result.rows[0].max;
    } catch (error) {
      logger.error(`Failed to get latest date from ${tableName}`, error);
      throw error;
    }
  }
};