import { google } from 'googleapis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Create a Google Sheets auth client
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: config.google.serviceAccountEmail,
    private_key: config.google.privateKey,
  },
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

// Initialize the sheets API
const sheetsApi = google.sheets({ version: 'v4', auth });

/**
 * Get rows from a Google Sheet
 * @param {string} range - The range in A1 notation
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @returns {Promise<Array>} - Array of rows
 */
export const getRows = async (range, spreadsheetId) => {
  try {
    logger.info(`Fetching data from sheet: ${spreadsheetId}, range: ${range}`);
    
    const response = await sheetsApi.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range,
    });
    
    logger.info(`Got ${response.data.values?.length || 0} rows from sheet`);
    return response.data.values || [];
  } catch (error) {
    logger.error(`Failed to fetch data from Google Sheets`, error);
    throw error;
  }
};

export default {
  getRows,
  
  /**
   * Format sheet data for SQL VALUES clause
   * @param {Array} rows - Array of data rows from sheets
   * @param {function} rowFormatter - Function to format each row (optional)
   * @returns {string} - VALUES clause for SQL query
   */
  formatRowsForSql: (rows, rowFormatter = null) => {
    if (!rows || rows.length === 0) {
      return null;
    }
    
    let values = rows
      .map(row => {
        // If a custom formatter is provided, use it
        if (rowFormatter) {
          return rowFormatter(row);
        }
        
        // Default formatting
        return `(${row
          .map(value => {
            if (value === undefined || value === null || value.trim() === '') {
              return 'NULL';
            } else if (!isNaN(parseFloat(value))) {
              return value;
            } else {
              // Escape single quotes
              return `'${value.replace(/'/g, "''")}'`;
            }
          })
          .join(', ')})`;
      })
      .join(',\n');
    
    return `VALUES ${values}`;
  }
};