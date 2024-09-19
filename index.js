import { getRows } from './src/connections/GoogleAPI.js'
import command from './src/postgresql.js'

async function GetMappedData() {
  const response = await getRows('Sheet1!A2:L')
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
