import pool from './connections/PSQL.js'

async function UpdateChannelGoogle(values) {
  try {
    await pool.query('DELETE FROM google_channel_report')
    await pool.query(`INSERT INTO google_channel_report (
    date, channel_group, sessions, total_users, new_users, bounce_rate, engagement_rate, average_session_duration, ecommerce_purchases, user_key_event_rate
    )
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateChannelGoogle }
