# Data Automation Tool

This project automates the process of fetching data from Google Sheets and inserting it into a PostgreSQL database. It's designed to handle marketing data from multiple sources, including Meta (Facebook/Instagram), Google, Mercado Libre, and other channels.

## Features

- Extracts data from multiple Google Sheets
- Processes and transforms data for database insertion
- Inserts data into PostgreSQL tables
- Comprehensive logging to track the process
- Modular architecture for easy maintenance and extension

## Project Structure

```
├── index.js                # Main entry point
├── src/
│   ├── config/             # Configuration settings
│   ├── services/           # External service clients (DB, Google Sheets)
│   ├── repositories/       # Database operations
│   ├── jobs/               # Data processing jobs
│   ├── utils/              # Utility functions
│   └── index.js            # Module entry point
├── .env                    # Environment variables (not in git)
├── .github/workflows/      # GitHub Actions workflow
└── package.json            # Project dependencies
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/data-automation-tool.git
   cd data-automation-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables:
   ```
   # PostgreSQL database configuration
   PG_HOST=your-postgres-host
   PG_PORT=5432
   PG_DATABASE=your-database-name
   PG_USER=your-username
   PG_PASSWORD=your-password

   # Google API configuration
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
   GOOGLE_PRIVATE_KEY="your-private-key"
   
   # Google Spreadsheet IDs
   GOOGLE_SPREADSHEET_ID=your-main-spreadsheet-id
   GOOGLE_SPREADSHEET_META_REPORT_ID=your-meta-report-spreadsheet-id
   GOOGLE_SPREADSHEET_STORIES_REPORT_ID=your-stories-report-spreadsheet-id
   GOOGLE_SPREADSHEET_GOOGLE_REPORT_ID=your-google-report-spreadsheet-id
   GOOGLE_SPREADSHEET_MELI_REPORT_ID=your-meli-report-spreadsheet-id
   GOOGLE_SPREADSHEET_PAID_CHANNELS_REPORT=your-paid-channels-report-spreadsheet-id
   ```

## Usage

Run the data update process:

```bash
npm start
```

This will:
1. Fetch data from all configured Google Sheets
2. Process and transform the data
3. Insert the data into the appropriate database tables
4. Log the process details

## GitHub Actions

This project includes a GitHub Actions workflow that runs the data update process automatically:

- On manual trigger via the GitHub UI
- When triggered by a webhook
- On a schedule (6:00 AM daily)

## Development

To add support for new data sources:

1. Create a new job in the `src/jobs` directory
2. Create a repository in the `src/repositories` directory
3. Update the main index.js file to include the new job

## License

MIT