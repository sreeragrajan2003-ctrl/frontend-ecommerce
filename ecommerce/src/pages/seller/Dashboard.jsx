import { useState, useEffect } from 'react'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch products and orders at the same time
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/product/my/'),
          api.get('/orders/')
        ])

        const orders = ordersRes.data

        setStats({
          totalProducts: productsRes.data.length,
          totalOrders: orders.length,
          // Count how many orders are still pending
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          // Count how many orders are delivered
          deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        })
      } catch {
        // Keep zeros if fetch fails
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <SellerLayout>
      <div className="dashboard-container">

        <h1 className="dashboard-title">Dashboard</h1>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <div className="stats-grid">

            <div className="stat-card">
              <span className="stat-icon">📦</span>
              <div className="stat-info">
                <span className="stat-number">{stats.totalProducts}</span>
                <span className="stat-label">Total Products</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">🧾</span>
              <div className="stat-info">
                <span className="stat-number">{stats.totalOrders}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">⏳</span>
              <div className="stat-info">
                <span className="stat-number">{stats.pendingOrders}</span>
                <span className="stat-label">Pending Orders</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-number">{stats.deliveredOrders}</span>
                <span className="stat-label">Delivered Orders</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </SellerLayout>
  )
}

export default Dashboard