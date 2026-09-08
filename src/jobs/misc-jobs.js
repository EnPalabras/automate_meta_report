import config from '../config/index.js';
import sheetsClient, { getRows } from '../services/sheets-client.js';
import { adsRepository, combinedReportRepository, meliRepository } from '../repositories/other-repositories.js';
import { formatDate, getNextDay } from '../utils/data-processors.js';
import logger from '../utils/logger.js';

// Spreadsheet IDs
const MAIN_SPREADSHEET_ID = config.google.spreadsheets.main;
const MELI_SPREADSHEET_ID = config.google.spreadsheets.meli;
const PAID_CHANNELS_SPREADSHEET_ID = config.google.spreadsheets.paidChannels;

// cuantos dias se recargan de MELI en cada corrida (MELI ajusta el gasto varios dias)
const MELI_REFRESH_DAYS = 5;

/**
 * Process ads mapping data
 */
export const adsMappingJob = async () => {
  logger.start('Ads Mapping');
  try {
    const data = await getRows('Mapping!A2:L', MAIN_SPREADSHEET_ID);
    
    // Encontrar el número máximo de columnas en los datos
    const maxColumns = 12; // A2:L son 12 columnas
    
    // Asegurar que todas las filas tengan el mismo número de columnas
    const normalizedData = data.map(row => {
      // Si la fila tiene menos columnas que el máximo, rellenar con valores vacíos
      if (row.length < maxColumns) {
        return [...row, ...Array(maxColumns - row.length).fill('')];
      }
      return row;
    });
    
    const valuesClause = sheetsClient.formatRowsForSql(normalizedData, (row) => {
      return `(${row.map(value => {
        // Manejar valores vacíos o nulos
        if (value === undefined || value === null || value.trim() === '') {
          return 'NULL';
        }
        return `'${value.replace(/'/g, "''")}'`;
      }).join(', ')})`;
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
    const data = await getRows('Combined by Day!A2:I', PAID_CHANNELS_SPREADSHEET_ID);
    
    // largo maximo de las columnas de texto de combined_report_by_day:
    // date, campaign_name(200), ad_name(200), channel(100)
    const MAX_LEN = [null, 200, 200, 100];

    const valuesClause = sheetsClient.formatRowsForSql(data, (row) => {
      return `(${row.map((value, index) => {
        if (index > 3) return value;
        // recortar: un ad_name de Meta mas largo que la columna hacia fallar el
        // INSERT entero y la tabla quedaba sin actualizar (en silencio)
        const clean = value.replaceAll("'", '').slice(0, MAX_LEN[index] ?? undefined);
        return `'${clean}'`;
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
export const meliJob = async (fromDate) => {
  logger.start('Mercado Libre');
  try {
    // Get data from sheet
    const data = await getRows('Campaigns 2V!A2:U', MELI_SPREADSHEET_ID);
    
    // Desde donde recargar. Antes esto solo apendeaba fechas nuevas
    // (lastDate + 1), asi que una fila que entraba mal quedaba mal para
    // siempre: es lo que paso con el gasto de MELI del 11-ago-2026, que quedo
    // en ~5% del real hasta que se corrigio el sheet a mano.
    // Ahora se reemplazan siempre los ultimos MELI_REFRESH_DAYS dias, o desde
    // la fecha que se pase por parametro (node src/manual.js meli 2026-08-10).
    const from = fromDate || formatDate(new Date(Date.now() - MELI_REFRESH_DAYS * 86400000));
    logger.info(`Recargando Mercado Libre desde ${from}`);
    
    const filteredData = data.filter(row => {
      const rowDate = row[1] ? new Date(row[1]) : null;
      return rowDate && formatDate(rowDate) >= from;
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
    
    // Borra esas fechas e inserta las del sheet, en una transaccion
    await meliRepository.replaceMeliFrom(from, query);
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