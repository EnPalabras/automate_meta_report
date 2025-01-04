import { getRows } from './connections/GoogleAPI.js'
import dotenv from 'dotenv'
import pool from './connections/PSQL.js'

dotenv.config()

const { GOOGLE_SPREADSHEET_MELI_REPORT_ID } = process.env

async function LastDateFromDB() {
  try {
    const result = await pool.query('SELECT MAX("date") FROM meli_campaigns')
    return result.rows[0].max
  } catch (error) {
    console.log('probando', error)
  }
}

async function GetDataFromSheets() {
  const response = await getRows(
    'Campaigns 2V!A2:U',
    GOOGLE_SPREADSHEET_MELI_REPORT_ID
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

  const arrayFiltrado = consultas.filter((lista) => lista[1] >= fechaSiguiente)

  if (arrayFiltrado.length === 0)
    return console.log('No hay datos de Mercado Libre para agregar')

  let consulta = 'INSERT INTO "meli_campaigns" VALUES '
  let valores = arrayFiltrado
    .map((fila) => {
      const fecha = new Date(fila[1]).toISOString().slice(0, 10)
      const id = fila[0]
      return `('${id}', '${fecha}', ${fila
        .slice(2)
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

async function InsertDataMeli() {
  const consulta = await FilterDates()

  try {
    await pool.query(consulta)
  } catch (error) {
    console.log(error)
  }
}
export default InsertDataMeli
