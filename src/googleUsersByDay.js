import pool from './connections/PSQL.js'

async function UpdateUsersByDay(values) {
  try {
    await pool.query('DELETE FROM google_users_by_day')
    await pool.query(`INSERT INTO google_users_by_day (
    date, sessions, totalUsers, newUsers, engagedSessions, addToCarts, checkouts, ecommercePurchases)
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

async function UpdateSalesFunnel(values) {
  try {
    await pool.query('DELETE FROM google_sales_funnel')
    await pool.query(`INSERT INTO google_sales_funnel (
    yearMonth, sessions, totalUsers, newUsers, engagedSessions, screenPageViews, itemListViewEvents, itemListClickEvents, addToCarts, removeFromCart, checkouts, addShippingInfo, addPaymentInfo, ecommercePurchases)
    ${values}
    `)
  } catch (error) {
    console.log('probando', error)
  }
}

export { UpdateUsersByDay, UpdateSalesFunnel }
