import { getRows } from './connections/GoogleAPI.js'
import dotenv from 'dotenv'
import pool from './connections/PSQL.js'

dotenv.config()

const { GOOGLE_SPREADSHEET_GOOGLE_REPORT_ID } = process.env

async function LastDateFromDB() {
  try {
    const result = await pool.query(
      'SELECT MAX("date") FROM "google_paid_report"'
    )
    return result.rows[0].max
  } catch (error) {
    console.log('probando', error)
  }
}

async function GetDataFromSheets() {
  const response = await getRows(
    'Campaigns Report!A2:J',
    GOOGLE_SPREADSHEET_GOOGLE_REPORT_ID
  )

  const values = response.data.values

  return values
}

async function FilterDates() {
  const consultas = await GetDataFromSheets()
  const last_date = await LastDateFromDB()
  const next_date = new Date(last_date)
  next_date.setDate(next_date.getDate() + 1)
  const fechaSiguiente = next_date.toISOString().slice(0, 10)

  const arrayFiltrado = consultas.filter((lista) => lista[0] >= fechaSiguiente)

  let consulta = 'INSERT INTO "google_paid_report" VALUES '

  let valores = arrayFiltrado

    .map((fila) => {
      const fecha = new Date(fila[0]).toISOString().slice(0, 10)
      return `('${fecha}', ${fila
        .slice(1)
        .map((valor, index) => {
          if (index === 0) {
            return `'${valor.replace(/'/g, "\\'")}'`
          } else if (index !== 10) {
            if (valor.trim() === '') {
              return 0 // Reemplazamos por 0 si está vacío
            } else if (!isNaN(parseFloat(valor))) {
              return valor // Dejamos el valor como número (incluye decimales)
            } else {
              return `'${valor.replace(/'/g, "\\'")}'` // Escapamos las comillas simples internas
            }
          }
          // Verificamos si está vacío o si es un número (incluyendo decimales)
        })
        .join(', ')})`
    })
    .join(', \n')

  consulta += valores
  return consulta
}

async function InsertGoogleData() {
  const consulta = await FilterDates()

  try {
    // if (consulta.length > 33) {
    await pool.query(consulta)
    // } else console.log('No hay datos para agregar')
  } catch (error) {
    console.log(error)
  }
}
export default InsertGoogleData
