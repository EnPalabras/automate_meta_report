import { getRows } from './src/connections/GoogleAPI.js'
import command from './src/postgresql.js'
import dotenv from 'dotenv'
import InsertData from './src/meta_report.js'
import UpdateMessaging from './src/messaging_report.js'

dotenv.config()

const { GOOGLE_SPREADSHEET_ID, GOOGLE_SPREADSHEET_META_REPORT_ID } = process.env

async function GetMappedData() {
  const response = await getRows('Sheet1!A2:L', GOOGLE_SPREADSHEET_ID)
  const data = response.data.values

  let consulta = 'VALUES '

  let valores = data
    .map((fila) => {
      return `(
        ${fila
          .map((valor, index) => {
            return `'${valor}'`
          })
          .join(', ')}
    )`
    })
    .join(', \n')

  consulta += valores

  return consulta
}

async function GetMessagingData() {
  const response = await getRows(
    'Messaging Report!A2:E',
    GOOGLE_SPREADSHEET_META_REPORT_ID
  )
  const data = response.data.values

  let consulta = 'VALUES '

  let valores = data
    .map((fila) => {
      return `(${fila
        .map((valor, index) => {
          if (index === 4 && valor === '0') {
            return 'null'
          }
          if (index === 2 || index === 3) {
            return valor
          } else if (index !== 2 && index !== 3) return `'${valor}'`
        })
        .join(', ')})`
    })
    .join(', \n')

  consulta += valores
  return consulta
}

async function updateData() {
  try {
    const mapped_values = await GetMappedData()
    const values_messaging = await GetMessagingData()
    await command(mapped_values)
    await UpdateMessaging(values_messaging)
    await InsertData()
  } catch (error) {
    console.log(error)
  }
}

await updateData()
