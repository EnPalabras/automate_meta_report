import pool from './connections/PSQL.js'

async function UpdateMessaging(values) {
  try {
    await pool.query('DELETE FROM messagging_report')
    await pool.query(`INSERT INTO messagging_report (
    date, 
    platform, 
    total_contacts, 
    response_average, 
    response_time
    )
    ${values}
    `)

    console.log(values)
  } catch (error) {
    console.log('probando', error)
  }
}

export default UpdateMessaging
