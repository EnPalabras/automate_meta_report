import pool from './connections/PSQL.js'

async function UpdateCombinedReport(values) {
  try {
    await pool.query('DELETE FROM combined_report_by_day')
    await pool.query(`INSERT INTO combined_report_by_day (
    date, campaign_name, channel, impressions, clicks, spend, total_revenue, keyevents
    )
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateCombinedReport }
