// Main entry point that imports and runs the updateAllData function
import { updateAllData } from './src/index.js';

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