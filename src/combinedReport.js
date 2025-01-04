import pool from './connections/PSQL.js'

async function UpdateCombinedReport(values) {
  try {
    await pool.query('DELETE FROM combined_report')
    await pool.query(`INSERT INTO combined_report (
    Date, channel, campaign, impressions, clicks, spend, revenue, key_results
    )
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateCombinedReport }
