import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  // keyFile: './DB/connections/cred.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
})

const client = async () => {
  return await auth.getClient()
}

const googleSheets = google.sheets({
  version: 'v4',
  auth: client,
})

export const getRows = async (table_name, spreadsheet_id) => {
  const response = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: spreadsheet_id,
    range: table_name,
  })

  console.log(response.rows)

  return response
}
