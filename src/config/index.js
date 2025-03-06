import dotenv from 'dotenv';

dotenv.config();

export default {
  database: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    name: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  },
  google: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
    spreadsheets: {
      main: process.env.GOOGLE_SPREADSHEET_ID,
      meta: process.env.GOOGLE_SPREADSHEET_META_REPORT_ID,
      stories: process.env.GOOGLE_SPREADSHEET_STORIES_REPORT_ID,
      google: process.env.GOOGLE_SPREADSHEET_GOOGLE_REPORT_ID,
      meli: process.env.GOOGLE_SPREADSHEET_MELI_REPORT_ID,
      paidChannels: process.env.GOOGLE_SPREADSHEET_PAID_CHANNELS_REPORT,
    }
  },
  logger: {
    enabled: true,
    level: process.env.LOG_LEVEL || 'info',
  }
};