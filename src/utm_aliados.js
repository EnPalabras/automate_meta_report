import pool from './connections/PSQL.js'

async function UpdateUTMAliados(values) {
  try {
    await pool.query('DELETE FROM utm_report_aliados')
    await pool.query(`INSERT INTO utm_report_aliados (
    date, first_user_manual_ad_content, sessions, total_users, new_users, bounce_rate, engagement_rate, average_session_duration, ecommerce_purchases
    )
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateUTMAliados }
