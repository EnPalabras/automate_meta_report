import pool from './connections/PSQL.js'

async function UpdateIGByDay(values) {
  try {
    await pool.query('DELETE FROM instagram_by_day')
    await pool.query(`INSERT INTO instagram_by_day (
        date,
        impressions,
        reach,
        total_interactions,
        accounts_engaged,
        likes,
        comments,
        saves,
        shares,
        replies,
        profile_views,
        website_clicks,
        follower_count,
        all_followers
    )
    ${values}
    `)

    console.log(values)
  } catch (error) {
    console.log('probando', error)
  }
}

async function UpdateIGPosts(values) {
  try {
    await pool.query('DELETE FROM instagram_posts')
    await pool.query(`INSERT INTO instagram_posts (
        id,
        date,
        username,
        caption,
        media_type,
        media_product_type,
        likes,
        comments,
        shares,
        saved,
        reach,
        total_interactions,
        permalink 
    )
    ${values}
    `)

    console.log(values)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateIGPosts, UpdateIGByDay }
