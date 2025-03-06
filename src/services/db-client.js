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
    try {
      await pool.query(`DELETE FROM ${tableName}`);
      await pool.query(`INSERT INTO ${tableName} ${insertQuery}`);
      logger.info(`Table ${tableName} updated successfully`);
    } catch (error) {
      logger.error(`Failed to update table ${tableName}`, error);
      throw error;
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