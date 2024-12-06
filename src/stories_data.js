import pool from './connections/PSQL.js'

async function UpdateStories(values) {
  try {
    await pool.query('DELETE FROM instagram_stories')
    await pool.query(`INSERT INTO instagram_stories (
    story_id,
    date_uploaded, 
    name, 
    mediaProductType, 
    mediaType, 
    mediaUrl, 
    deletion_date, 
    reach, 
    impressions, 
    replies, 
    shares, 
    follows, 
    totalInteractions, 
    profileVisits, 
    profile_activity
    )
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateStories }
