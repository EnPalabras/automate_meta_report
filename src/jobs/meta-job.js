import config from '../config/index.js';
import sheetsClient, { getRows } from '../services/sheets-client.js';
import metaRepository from '../repositories/meta-repository.js';
import { formatDate, getNextDay, formatSqlValue, convertDateFormat } from '../utils/data-processors.js';
import logger from '../utils/logger.js';

// Spreadsheet ID for Meta data
const SPREADSHEET_ID = config.google.spreadsheets.meta;
const STORIES_SPREADSHEET_ID = config.google.spreadsheets.stories;

const MetaJob = {
  /**
   * Process Instagram data by day
   */
  processInstagramByDay: async () => {
    logger.start('Instagram by Day');
    try {
      const data = await getRows('Instagram by Day!A2:N', SPREADSHEET_ID);
      
      // Exclude the last two rows which might be totals/summary
      const largoData = data.length - 2;
      const registeredData = data.slice(0, largoData);
      
      const valuesClause = sheetsClient.formatRowsForSql(registeredData, (row) => {
        return `(${row.map((value, index) => {
          if ((index === 12 || index === 13) && value === '0') {
            return 'NULL';
          }
          if (index === 0) return `'${value}'`;
          return value;
        }).join(', ')})`;
      });
      
      await metaRepository.updateIgByDay(valuesClause);
      logger.success('Instagram by Day data updated successfully');
    } catch (error) {
      logger.error('Failed to process Instagram by Day data', error);
    }
    logger.end('Instagram by Day');
  },
  
  /**
   * Process Instagram posts data
   */
  processInstagramPosts: async () => {
    logger.start('Instagram Posts');
    try {
      const data = await getRows('Instagram Posts!A2:M', SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        return `(${row.map((value, index) => {
          if (index > 5 && index < 12) return value;
          return `'${value.replaceAll("'", '')}'`;
        }).join(', ')})`;
      });
      
      await metaRepository.updateIgPosts(valuesClause);
      logger.success('Instagram Posts data updated successfully');
    } catch (error) {
      logger.error('Failed to process Instagram Posts data', error);
    }
    logger.end('Instagram Posts');
  },
  
  /**
   * Process Instagram stories data
   */
  processInstagramStories: async () => {
    logger.start('Instagram Stories');
    try {
      const data = await getRows('Stories!A2:O', STORIES_SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        return `(${row.map((value, index) => {
          if (index === 6) return `'${convertDateFormat(value)}'`;
          if (index > 6) return value;
          return `'${value.replaceAll("'", '')}'`;
        }).join(', ')})`;
      });
      
      await metaRepository.updateStories(valuesClause);
      logger.success('Instagram Stories data updated successfully');
    } catch (error) {
      logger.error('Failed to process Instagram Stories data', error);
    }
    logger.end('Instagram Stories');
  },
  
  /**
   * Process messaging report data
   */
  processMessagingReport: async () => {
    logger.start('Messaging Report');
    try {
      const data = await getRows('Messaging Report!A2:E', SPREADSHEET_ID);
      
      const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
        return `(${row.map((value, index) => {
          if (index === 4 && value === '0') {
            return 'NULL';
          }
          if (index === 2 || index === 3) {
            return value;
          } else {
            return `'${value}'`;
          }
        }).join(', ')})`;
      });
      
      await metaRepository.updateMessaging(valuesClause);
      logger.success('Messaging Report data updated successfully');
    } catch (error) {
      logger.error('Failed to process Messaging Report data', error);
    }
    logger.end('Messaging Report');
  },
  
  /**
   * Process Meta report data
   */
  processMetaReport: async () => {
    logger.start('Meta Report');
    try {
      // Get data from sheet
      const data = await getRows('Meta Report!A2:V', SPREADSHEET_ID);
      
      // Get last date from database
      const lastDate = await metaRepository.getLastMetaReportDate();
      if (!lastDate) {
        logger.warn('No last date found in Meta Report table');
        return;
      }
      
      // Filter data by date (newer than last date)
      const nextDay = getNextDay(lastDate);
      const filteredData = data.filter(row => row[0] >= nextDay);
      
      if (filteredData.length === 0) {
        logger.info('No new Meta Report data to process');
        return;
      }
      
      // Format data for SQL
      const valuesClause = sheetsClient.formatRowsForSql(filteredData, (row) => {
        const date = formatDate(row[0]);
        return `('${date}', ${row.slice(1).map((value, index) => {
          if (index === 3) {
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
      
      // Insert data
      await metaRepository.insertMetaReportData(valuesClause);
    } catch (error) {
      logger.error('Failed to process Meta Report data', error);
    }
    logger.end('Meta Report');
  },
  
  /**
   * Run all Meta related jobs
   */
  runAll: async () => {
    try {
      await MetaJob.processInstagramByDay();
      await MetaJob.processInstagramPosts();
      await MetaJob.processInstagramStories();
      await MetaJob.processMessagingReport();
      await MetaJob.processMetaReport();
      logger.success('All Meta jobs completed successfully');
    } catch (error) {
      logger.error('Error running Meta jobs', error);
      throw error;
    }
  }
};

export default MetaJob;