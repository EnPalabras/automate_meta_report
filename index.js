// Main entry point that imports and runs the updateAllData function
import { updateAllData } from './src/index.js';
import GoogleJob from './src/jobs/google-job.js';
import logger from './src/utils/logger.js';

// Check if a specific command was passed
const command = process.argv[2];

if (command === 'rebuild-google-historical') {
  // Run only the historical rebuild
  logger.info('Starting historical campaigns rebuild process');
  GoogleJob.rebuildHistoricalCampaigns()
    .then(() => {
      logger.info('Historical campaigns rebuild completed');
      setTimeout(() => process.exit(0), 100);
    })
    .catch(error => {
      logger.error('Error rebuilding historical campaigns', error);
      process.exit(1);
    });
} else {
  // This allows this file to be run directly with: node index.js
  updateAllData()
    .then(() => {
      console.log('Data update completed');
      // Allow any pending logs to be written before exiting
      setTimeout(() => process.exit(0), 100);
    })
    .catch(error => {
      console.error('Failed to update data:', error);
      process.exit(1);
    });
}