import MetaJob from './jobs/meta-job.js';
import GoogleJob from './jobs/google-job.js';
import { runAllMiscJobs } from './jobs/misc-jobs.js';
import logger from './utils/logger.js';

/**
 * Main function to run all data update jobs
 */
const updateAllData = async () => {
  logger.start('COMPLETE DATA UPDATE PROCESS');
  
  try {
    // Run Meta data jobs
    await MetaJob.runAll();
    
    // Run Google data jobs
    await GoogleJob.runAll();
    
    // Run miscellaneous jobs
    await runAllMiscJobs();
    
    logger.success('ALL DATA UPDATE PROCESSES COMPLETED SUCCESSFULLY');
  } catch (error) {
    logger.error('ERROR IN DATA UPDATE PROCESS', error);
  }
  
  logger.end('COMPLETE DATA UPDATE PROCESS');
};

// Export the function for importing in other modules
export { updateAllData };

// Run the update when this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  updateAllData()
    .then(() => {
      logger.info('Program execution completed');
      // Allow any pending logs to be written before exiting
      setTimeout(() => process.exit(0), 100);
    })
    .catch(error => {
      logger.error('Unhandled error in program execution', error);
      process.exit(1);
    });
}