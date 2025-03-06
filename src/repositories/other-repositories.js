import db from '../services/db-client.js';
import logger from '../utils/logger.js';

export const adsRepository = {
  /**
   * Update ads mapping data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateAdsMapping: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Ads Mapping data to update');
      return;
    }
    
    await db.replaceTableData('ads_data', valuesClause);
  }
};

export const combinedReportRepository = {
  /**
   * Update combined report data
   * @param {string} valuesClause - The SQL VALUES clause
   * @returns {Promise<void>}
   */
  updateCombinedReport: async (valuesClause) => {
    if (!valuesClause) {
      logger.warn('No Combined Report data to update');
      return;
    }
    
    await db.replaceTableData('combined_report_by_day', valuesClause);
  }
};

export const meliRepository = {
  /**
   * Get the latest date from Mercado Libre campaigns table
   * @returns {Promise<string>} - Latest date in YYYY-MM-DD format
   */
  getLastMeliDate: async () => {
    return await db.getLatestDate('meli_campaigns', 'date');
  },
  
  /**
   * Insert new Mercado Libre data
   * @param {string} query - The complete SQL INSERT query
   * @returns {Promise<void>}
   */
  insertMeliData: async (query) => {
    if (!query) {
      logger.warn('No Mercado Libre data to insert');
      return;
    }
    
    await db.query(query);
    logger.success('Mercado Libre data inserted successfully');
  }
};