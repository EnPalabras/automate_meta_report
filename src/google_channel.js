import pool from './connections/PSQL.js'

async function UpdateChannelGoogle(values) {
  try {
    await pool.query('DELETE FROM google_channel_report')
    await pool.query(`INSERT INTO google_channel_report (
    yearMonth, primaryChannelGroup, sessions, totalUsers, bounceRate, engagementRate, keyEvents, totalRevenue
    )
    ${values}
    `)
  } catch (error) {
    console.log('Error Google Channel', error)
  }
}

export { UpdateChannelGoogle }
