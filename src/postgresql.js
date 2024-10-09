import pool from './connections/PSQL.js'

async function command(values) {
  try {
    const deleteAll = await pool.query('DELETE FROM ads_data')
    const result = await pool.query(`INSERT INTO ads_data (
    campaign_name,
    campaign_id,
    ad_group_name,
    ad_group_id,
    ad_name,
    ad_id,
    content_type,
    channel,
    subchannel,
    campaign_type,
    platform,
    target_product
)
    ${values}
    `)
  } catch (error) {
    console.log(error)
  }
}

export default command
