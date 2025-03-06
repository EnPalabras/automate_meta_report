import db from '../services/db-client.js';
import { formatDate, getNextDay } from '../utils/data-processors.js';
import logger from '../utils/logger.js';

export default {
  /**
   * Update Instagram data by day
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateIgByDay: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Instagram by Day data to update');
      return;
    }
    
    await db.replaceTableData('instagram_by_day', valuesClause);
  },
  
  /**
   * Update Instagram posts data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateIgPosts: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Instagram Posts data to update');
      return;
    }
    
    await db.replaceTableData('instagram_posts', valuesClause);
  },
  
  /**
   * Update Instagram stories data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateStories: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Instagram Stories data to update');
      return;
    }
    
    await db.replaceTableData('instagram_stories', valuesClause);
  },
  
  /**
   * Update messaging report data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateMessaging: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Messaging data to update');
      return;
    }
    
    await db.replaceTableData('messagging_report', valuesClause);
  },
  
  /**
   * Get the latest date from Meta report table
   * @returns {Promise<string>} - Latest date in YYYY-MM-DD format
   */
  getLastMetaReportDate: async () => {
    return await db.getLatestDate('meta_report', 'date');
  },
  
  /**
   * Insert new Meta report data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  insertMetaReportData: async (valuesClause) => {
    if (!valuesClause || valuesClause.length <= 33) {
      logger.warn('No Meta Report data to insert');
      return;
    }
    
    const query = `INSERT INTO meta_report ${valuesClause}`;
    await db.query(query);
    logger.success('Meta Report data inserted successfully');
  }
};