import { getRows } from './connections/GoogleAPI.js'
import dotenv from 'dotenv'
import pool from './connections/PSQL.js'

dotenv.config()

const { GOOGLE_SPREADSHEET_META_REPORT_ID } = process.env

async function LastDateFromDB() {
  try {
    const result = await pool.query('SELECT MAX("Date") FROM "meta_report"')
    return result.rows[0].max
  } catch (error) {
    console.log('probando', error)
  }
}

async function GetDataFromSheets() {
  const response = await getRows(
    'Meta Report!A2:V',
    GOOGLE_SPREADSHEET_META_REPORT_ID
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

  const arrayFiltrado = consultas.filter((lista) => lista[0] === fechaSiguiente)

  let consulta = 'INSERT INTO "meta_report" VALUES '

  let valores = arrayFiltrado

    .map((fila) => {
      const fecha = new Date(fila[0]).toISOString().slice(0, 10)
      return `('${fecha}', ${fila
        .slice(1)
        .map((valor, index) => {
          if (index === 3) {
            return `'${valor.replace(/'/g, "\\'")}'`
          } else if (index !== 3) {
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

async function InsertData() {
  const consulta = await FilterDates()

  try {
    if (consulta.length > 33) {
      await pool.query(consulta)
    } else console.log('No hay datos para agregar')
  } catch (error) {
    console.log(error)
  }
}
export default InsertData
