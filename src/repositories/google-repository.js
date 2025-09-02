import db from '../services/db-client.js';
import logger from '../utils/logger.js';

export default {
  /**
   * Update Google channel report data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateChannelGoogle: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Google Channel data to update');
      return;
    }
    
    await db.replaceTableData('google_channel_report', valuesClause);
  },
  
  /**
   * Update UTM Aliados data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateUTMAliados: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No UTM Aliados data to update');
      return;
    }
    
    await db.replaceTableData('utm_report_aliados', valuesClause);
  },
  
  /**
   * Update Google users by day data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateUsersByDay: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Google Users by Day data to update');
      return;
    }
    
    await db.replaceTableData('google_users_by_day', valuesClause);
  },
  
  /**
   * Update Sales funnel data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateSalesFunnel: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Sales Funnel data to update');
      return;
    }
    
    await db.replaceTableData('google_sales_funnel', valuesClause);
  },
  
  /**
   * Delete Google paid report data from the last three months and get the latest remaining date
   * @returns {Promise<string>} - Latest date in YYYY-MM-DD format after deletion
   */
  cleanupAndGetLastGoogleReportDate: async () => {
    try {
      // Calculate date from 2 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsAgoStr = threeMonthsAgo.toISOString().slice(0, 10);
      
      logger.info(`Deleting Google Paid Report data from ${threeMonthsAgoStr} onwards`);
      
      // Delete data from the last three months
      await db.query(`DELETE FROM google_paid_report WHERE date >= $1`, [threeMonthsAgoStr]);
      
      // Get the latest date after deletion
      const result = await db.query(`SELECT MAX(date) FROM google_paid_report`);
      const latestDate = result.rows[0].max;
      
      logger.info(`Latest date in Google Paid Report after cleanup: ${latestDate}`);
      return latestDate;
    } catch (error) {
      logger.error('Failed to cleanup Google Paid Report data', error);
      throw error;
    }
  },
  
  /**
   * Delete Google paid report data within a specific date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<void>}
   */
  deleteGoogleReportDateRange: async (startDate, endDate) => {
    try {
      const result = await db.query(
        `DELETE FROM google_paid_report WHERE date >= $1 AND date <= $2`,
        [startDate, endDate]
      );
      logger.info(`Deleted ${result.rowCount} rows from Google Paid Report between ${startDate} and ${endDate}`);
    } catch (error) {
      logger.error('Failed to delete Google Paid Report data range', error);
      throw error;
    }
  },
  
  /**
   * Insert new Google paid report data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  insertGoogleReportData: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Google Paid Report data to insert');
      return;
    }
    
    const query = `INSERT INTO google_paid_report ${valuesClause}`;
    await db.query(query);
    logger.success('Google Paid Report data inserted successfully');
  }
};