/**
 * Collection of helper functions for data processing
 */

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
    if (!date) return null;
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
  };
  
  /**
   * Get the next day after a given date
   * @param {Date|string} date - The reference date
   * @returns {string} - The next day in YYYY-MM-DD format
   */
  export const getNextDay = (date) => {
    if (!date) return null;
    
    const d = typeof date === 'string' ? new Date(date) : date;
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    return formatDate(nextDay);
  };
  
  /**
   * Convert date format from DD/MM/YYYY to YYYY-MM-DD
   * @param {string} dateString - Date in format DD/MM/YYYY
   * @returns {string} - Date in format YYYY-MM-DD
   */
  export const convertDateFormat = (dateString) => {
    if (!dateString) return null;
    
    // Divide la fecha y la hora
    const [datePart] = dateString.split(' ');
    // Divide la parte de la fecha en día, mes y año
    const [day, month, year] = datePart.split('/');
    // Formatea la fecha en el formato YYYY-MM-DD
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  /**
   * Filter data rows by date
   * @param {Array} rows - Data rows (first column should be date)
   * @param {string} lastDate - Last processed date in YYYY-MM-DD format
   * @returns {Array} - Filtered rows
   */
  export const filterRowsByDate = (rows, lastDate) => {
    if (!rows || !lastDate) return rows;
    
    const nextDay = getNextDay(lastDate);
    return rows.filter(row => row[0] >= nextDay);
  };
  
  /**
   * Format a value for SQL query based on its type
   * @param {any} value - The value to format
   * @param {boolean} isTesxt - Whether the value should be treated as text
   * @returns {string} - Formatted value for SQL
   */
  export const formatSqlValue = (value, isText = false) => {
    if (value === undefined || value === null || value === '') {
      return 'NULL';
    }
    
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    
    if (trimmedValue === '') {
      return '0'; // Empty string becomes 0 for numerical columns
    }
    
    if (isText || isNaN(parseFloat(trimmedValue))) {
      // Escape single quotes for text values
      return `'${String(trimmedValue).replace(/'/g, "''")}'`;
    }
    
    return trimmedValue; // Numbers pass through directly
  };