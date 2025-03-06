import config from '../config/index.js';
import sheetsClient, { getRows } from '../services/sheets-client.js';
import googleRepository from '../repositories/google-repository.js';
import { formatDate, getNextDay, formatSqlValue } from '../utils/data-processors.js';
import logger from '../utils/logger.js';

// Spreadsheet ID for Google data
const SPREADSHEET_ID = config.google.spreadsheets.google;

const GoogleJob = {
  /**
   * Process Google channel report data
   */
  processGoogleChannel: async () => {
    logger.start('Google Channel Report');
    try {
      const data = await getRows('Channel Report!A2:H', SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        const date = formatDate(row[0]);
        return `('${date}', ${row.slice(1).map((value, index) => {
          if (index === 0) {
            return `'${value.replace(/'/g, "\\'")}'`;
          } else {
            if (value.trim() === '') {
              return 0;
            } else if (!isNaN(parseFloat(value))) {
              return value;
            } else {
              return `'${value.replace(/'/g, "\\'")}'`;
            }
          }
        }).join(', ')})`;
      });
      
      await googleRepository.updateChannelGoogle(valuesClause);
      logger.success('Google Channel Report data updated successfully');
    } catch (error) {
      logger.error('Failed to process Google Channel Report data', error);
    }
    logger.end('Google Channel Report');
  },
  
  /**
   * Process UTM Aliados data
   */
  processUTMAliados: async () => {
    logger.start('UTM Aliados Report');
    try {
      const data = await getRows('UTM Report!A2:I', SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        return `(${row.map((value, index) => {
          if (index > 1) return value;
          return `'${value.replaceAll("'", '')}'`;
        }).join(', ')})`;
      });
      
      await googleRepository.updateUTMAliados(valuesClause);
      logger.success('UTM Aliados Report data updated successfully');
    } catch (error) {
      logger.error('Failed to process UTM Aliados Report data', error);
    }
    logger.end('UTM Aliados Report');
  },
  
  /**
   * Process Google users by day data
   */
  processUsersByDay: async () => {
    logger.start('Google Users by Day');
    try {
      const data = await getRows('Users & CR!A2:H', SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        const date = formatDate(row[0]);
        return `('${date}', ${row.slice(1).map((value, index) => {
          if (value.trim() === '') {
            return 0;
          } else if (!isNaN(parseFloat(value))) {
            return value;
          } else {
            return `'${value.replace(/'/g, "\\'")}'`;
          }
        }).join(', ')})`;
      });
      
      await googleRepository.updateUsersByDay(valuesClause);
      logger.success('Google Users by Day data updated successfully');
    } catch (error) {
      logger.error('Failed to process Google Users by Day data', error);
    }
    logger.end('Google Users by Day');
  },
  
  /**
   * Process Google sales funnel data
   */
  processSalesFunnel: async () => {
    logger.start('Google Sales Funnel');
    try {
      const data = await getRows('Sales Funnel!A2:N', SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        const date = formatDate(row[0]);
        return `('${date}', ${row.slice(1).map((value, index) => {
          if (value.trim() === '') {
            return 0;
          } else if (!isNaN(parseFloat(value))) {
            return value;
          } else {
            return `'${value.replace(/'/g, "\\'")}'`;
          }
        }).join(', ')})`;
      });
      
      await googleRepository.updateSalesFunnel(valuesClause);
      logger.success('Google Sales Funnel data updated successfully');
    } catch (error) {
      logger.error('Failed to process Google Sales Funnel data', error);
    }
    logger.end('Google Sales Funnel');
  },
  
  /**
   * Process Google paid report data
   * This process:
   * 1. Deletes data from the last three months
   * 2. Loads new data with dates greater than the last date in the database
   */
  processGoogleReport: async () => {
    logger.start('Google Paid Report');
    try {
      // Get data from sheet
      const data = await getRows('Campaigns Report!A2:J', SPREADSHEET_ID);
      
      // First delete data from the last three months and get the latest remaining date
      const lastDate = await googleRepository.cleanupAndGetLastGoogleReportDate();
      if (!lastDate) {
        logger.warn('No data found in Google Paid Report table after cleanup');
        
        // If no data remains, we'll load all available data
        const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
          const date = formatDate(row[0]);
          return `('${date}', ${row.slice(1).map((value, index) => {
            if (index === 0) {
              return `'${value.replace(/'/g, "\\'")}'`;
            } else if (index !== 10) {
              if (value.trim() === '') {
                return 0;
              } else if (!isNaN(parseFloat(value))) {
                return value;
              } else {
                return `'${value.replace(/'/g, "\\'")}'`;
              }
            }
          }).join(', ')})`;
        });
        
        await googleRepository.insertGoogleReportData(valuesClause);
        logger.success('All Google Paid Report data loaded');
        return;
      }
      
      // Filter data by date (newer than last date)
      const nextDay = getNextDay(lastDate);
      logger.info(`Filtering Google Paid Report data from ${nextDay} onwards`);
      
      const filteredData = data.filter(row => row[0] >= nextDay);
      
      if (filteredData.length === 0) {
        logger.info('No new Google Paid Report data to process');
        return;
      }
      
      logger.info(`Found ${filteredData.length} new rows to insert`);
      
      // Format data for SQL
      const valuesClause = sheetsClient.formatRowsForSql(filteredData, (row) => {
        const date = formatDate(row[0]);
        return `('${date}', ${row.slice(1).map((value, index) => {
          if (index === 0) {
            return `'${value.replace(/'/g, "\\'")}'`;
          } else if (index !== 10) {
            if (value.trim() === '') {
              return 0;
            } else if (!isNaN(parseFloat(value))) {
              return value;
            } else {
              return `'${value.replace(/'/g, "\\'")}'`;
            }
          }
        }).join(', ')})`;
      });
      
      // Insert data
      await googleRepository.insertGoogleReportData(valuesClause);
    } catch (error) {
      logger.error('Failed to process Google Paid Report data', error);
    }
    logger.end('Google Paid Report');
  },
  
  /**
   * Run all Google related jobs
   */
  runAll: async () => {
    try {
      await GoogleJob.processGoogleChannel();
      await GoogleJob.processUTMAliados();
      await GoogleJob.processUsersByDay();
      await GoogleJob.processSalesFunnel();
      await GoogleJob.processGoogleReport();
      logger.success('All Google jobs completed successfully');
    } catch (error) {
      logger.error('Error running Google jobs', error);
      throw error;
    }
  }
};

export default GoogleJob;