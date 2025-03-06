import config from '../config/index.js';
import sheetsClient, { getRows } from '../services/sheets-client.js';
import { adsRepository, combinedReportRepository, meliRepository } from '../repositories/other-repositories.js';
import { formatDate, getNextDay } from '../utils/data-processors.js';
import logger from '../utils/logger.js';

// Spreadsheet IDs
const MAIN_SPREADSHEET_ID = config.google.spreadsheets.main;
const MELI_SPREADSHEET_ID = config.google.spreadsheets.meli;
const PAID_CHANNELS_SPREADSHEET_ID = config.google.spreadsheets.paidChannels;

/**
 * Process ads mapping data
 */
export const adsMappingJob = async () => {
  logger.start('Ads Mapping');
  try {
    const data = await getRows('Sheet1!A2:L', MAIN_SPREADSHEET_ID);
    
    const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
      return `(${row.map(value => `'${value.replace(/'/g, "''")}'`).join(', ')})`;
    });
    
    await adsRepository.updateAdsMapping(valuesClause);
    logger.success('Ads Mapping data updated successfully');
  } catch (error) {
    logger.error('Failed to process Ads Mapping data', error);
  }
  logger.end('Ads Mapping');
};

/**
 * Process combined report data
 */
export const combinedReportJob = async () => {
  logger.start('Combined Report');
  try {
    const data = await getRows('Combined by Day!A2:H', PAID_CHANNELS_SPREADSHEET_ID);
    
    const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
      return `(${row.map((value, index) => {
        if (index > 2) return value;
        return `'${value.replaceAll("'", '')}'`;
      }).join(', ')})`;
    });
    
    await combinedReportRepository.updateCombinedReport(valuesClause);
    logger.success('Combined Report data updated successfully');
  } catch (error) {
    logger.error('Failed to process Combined Report data', error);
  }
  logger.end('Combined Report');
};

/**
 * Process Mercado Libre data
 */
export const meliJob = async () => {
  logger.start('Mercado Libre');
  try {
    // Get data from sheet
    const data = await getRows('Campaigns 2V!A2:U', MELI_SPREADSHEET_ID);
    
    // Get last date from database
    const lastDate = await meliRepository.getLastMeliDate();
    if (!lastDate) {
      logger.warn('No last date found in Mercado Libre campaigns table');
      return;
    }
    
    // Filter data by date (newer than last date)
    const nextDay = getNextDay(lastDate);
    const filteredData = data.filter(row => {
      const rowDate = row[1] ? new Date(row[1]) : null;
      return rowDate && formatDate(rowDate) >= nextDay;
    });
    
    if (filteredData.length === 0) {
      logger.info('No new Mercado Libre data to process');
      return;
    }
    
    // Construct SQL query
    let query = 'INSERT INTO "meli_campaigns" VALUES ';
    
    const values = filteredData.map(row => {
      const date = formatDate(row[1]);
      const id = row[0];
      
      return `('${id}', '${date}', ${row.slice(2).map((value, index) => {
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
    }).join(', \n');
    
    query += values;
    
    // Insert data
    await meliRepository.insertMeliData(query);
    logger.success('Mercado Libre data inserted successfully');
  } catch (error) {
    logger.error('Failed to process Mercado Libre data', error);
  }
  logger.end('Mercado Libre');
};

/**
 * Run all miscellaneous jobs
 */
export const runAllMiscJobs = async () => {
  try {
    await adsMappingJob();
    await combinedReportJob();
    await meliJob();
    logger.success('All miscellaneous jobs completed successfully');
  } catch (error) {
    logger.error('Error running miscellaneous jobs', error);
    throw error;
  }
};