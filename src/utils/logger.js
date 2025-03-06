import config from '../config/index.js';

// Simple console logger with timestamp
const logger = {
  info: (message, data = '') => {
    if (config.logger.enabled) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [INFO] ${message}`, data ? data : '');
    }
  },
  
  success: (message) => {
    if (config.logger.enabled) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [SUCCESS] ${message}`);
    }
  },
  
  warn: (message, data = '') => {
    if (config.logger.enabled) {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] [WARN] ${message}`, data ? data : '');
    }
  },
  
  error: (message, error = null) => {
    if (config.logger.enabled) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] [ERROR] ${message}`);
      if (error) {
        console.error(error);
      }
    }
  },
  
  start: (processName) => {
    if (config.logger.enabled) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [START] Process: ${processName}`);
    }
  },
  
  end: (processName) => {
    if (config.logger.enabled) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [END] Process: ${processName}`);
    }
  }
};

export default logger;