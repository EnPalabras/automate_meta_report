import { getRows } from './src/connections/GoogleAPI.js'
import command from './src/postgresql.js'
import dotenv from 'dotenv'
import InsertData from './src/meta_report.js'
import UpdateMessaging from './src/messaging_report.js'
import { UpdateIGByDay, UpdateIGPosts } from './src/instagram_data.js'
import { UpdateStories } from './src/stories_data.js'
dotenv.config()

const {
  GOOGLE_SPREADSHEET_ID,
  GOOGLE_SPREADSHEET_META_REPORT_ID,
  GOOGLE_SPREADSHEET_STORIES_REPORT_ID,
} = process.env

function convertDateToYYYYMMDD(dateString) {
  // Divide la fecha y la hora
  const [datePart, timePart] = dateString.split(' ')
  // Divide la parte de la fecha en día, mes y año
  const [day, month, year] = datePart.split('/')
  // Formatea la fecha en el formato YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`
  return `'${formattedDate}'`
}

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

async function GetInstagramByDay() {
  const response = await getRows(
    'Instagram by Day!A2:N',
    GOOGLE_SPREADSHEET_META_REPORT_ID
  )
  const data = response.data.values

  let consulta = 'VALUES '

  let valores = data
    .map((fila, index) => {
      if (index + 1 === data.length) return
      if (fila.length !== 14) console.log(fila.length)
      return `(${fila
        .map((valor, index) => {
          if ((index === 12 || index === 13) && valor === '0') {
            return 'null'
          }
          if (index === 0) return `'${valor}'`
          return valor
        })
        .join(', ')})`
    })
    .join(', \n')

  consulta += valores
  console.log(consulta)
  return consulta.replace(/,\s*$/, '')
}

async function GetPostsData() {
  const response = await getRows(
    'Instagram Posts!A2:M',
    GOOGLE_SPREADSHEET_META_REPORT_ID
  )
  const data = response.data.values

  let consulta = 'VALUES '

  let valores = data
    .map((fila, index) => {
      console.log(fila.length)
      return `(${fila
        .map((valor, index) => {
          if (index > 5 && index < 12) return valor
          return `'${valor.replaceAll("'", '')}'`
        })
        .join(', ')})`
    })
    .join(', \n')

  consulta += valores
  console.log(consulta)
  return consulta
}

async function GetStoriesData() {
  const response = await getRows(
    'Stories!A2:O',
    GOOGLE_SPREADSHEET_STORIES_REPORT_ID
  )
  const data = response.data.values

  let consulta = 'VALUES '

  let valores = data
    .map((fila, index) => {
      return `(${fila
        .map((valor, index) => {
          if (index === 1 || index === 6) return convertDateToYYYYMMDD(valor)
          if (index > 6) return valor
          return `'${valor.replaceAll("'", '')}'`
        })
        .join(', ')})`
    })
    .join(', \n')

  consulta += valores
  console.log(consulta)
  return consulta
}

async function updateData() {
  try {
    const mapped_values = await GetMappedData()
    const values_messaging = await GetMessagingData()
    const ig_data_by_day = await GetInstagramByDay()
    const get_stories_data = await GetStoriesData()
    const posts = await GetPostsData()
    await UpdateStories(get_stories_data)
    await command(mapped_values)
    await UpdateMessaging(values_messaging)

    await InsertData()
    await UpdateIGByDay(ig_data_by_day)
    await UpdateIGPosts(posts)
  } catch (error) {
    console.log(error)
  }
}

await updateData()
