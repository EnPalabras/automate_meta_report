import { getRows } from './src/connections/GoogleAPI.js'
import command from './src/postgresql.js'
import dotenv from 'dotenv'
import InsertData from './src/meta_report.js'

dotenv.config()

const { GOOGLE_SPREADSHEET_ID } = process.env

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

async function updateData() {
  try {
    const mapped_values = await GetMappedData()

    await command(mapped_values)
  } catch (error) {
    console.log(error)
  }
}

await updateData()
await InsertData()
