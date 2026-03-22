import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function Dashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  })

  const [recentProducts, setRecentProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/product/my/'),
          api.get('/orders/')
        ])

        const products = productsRes.data
        const orders = ordersRes.data

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        })

        // Latest 5 products — highest id = newest
        setRecentProducts(
          [...products].sort((a, b) => b.id - a.id).slice(0, 5)
        )

        // Latest 5 orders
        setRecentOrders(
          [...orders].sort((a, b) => b.id - a.id).slice(0, 5)
        )

      } catch {
        // Keep zeros if fetch fails
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // Status badge color class
  function statusClass(status) {
    switch (status) {
      case 'pending':   return 'status-pending'
      case 'shipped':   return 'status-shipped'
      case 'delivered': return 'status-delivered'
      case 'cancelled': return 'status-cancelled'
      default:          return ''
    }
  }

  // Stat card config — each card knows where to navigate
  const statCards = [
    {
      icon: '📦',
      number: stats.totalProducts,
      label: 'Total Products',
      color: '#e3f2fd',
      iconBg: '#1565c0',
      onClick: () => navigate('/seller/products')
    },
    {
      icon: '🧾',
      number: stats.totalOrders,
      label: 'Total Orders',
      color: '#f3e5f5',
      iconBg: '#6a1b9a',
      onClick: () => navigate('/seller/orders')
    },
    {
      icon: '⏳',
      number: stats.pendingOrders,
      label: 'Pending Orders',
      color: '#fff3e0',
      iconBg: '#e65100',
      onClick: () => navigate('/seller/orders')
    },
    {
      icon: '✅',
      number: stats.deliveredOrders,
      label: 'Delivered Orders',
      color: '#e8f5e9',
      iconBg: '#2e7d32',
      onClick: () => navigate('/seller/orders')
    },
  ]

  return (
    <SellerLayout>
      <div className="dashboard-container">

        <h1 className="dashboard-title">Dashboard</h1>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            {/* ===== STAT CARDS ===== */}
            <div className="stats-grid">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="stat-card stat-card-clickable"
                  style={{ background: card.color }}
                  onClick={card.onClick}
                >
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: card.iconBg }}
                  >
                    <span className="stat-icon">{card.icon}</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{card.number}</span>
                    <span className="stat-label">{card.label}</span>
                  </div>
                  <span className="stat-arrow">→</span>
                </div>
              ))}
            </div>

            {/* ===== RECENT PRODUCTS ===== */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Recent Products</h2>
                <button
                  className="dashboard-view-all"
                  onClick={() => navigate('/seller/products')}
                >
                  View all →
                </button>
              </div>

              {recentProducts.length === 0 ? (
                <div className="dashboard-empty">
                  <p>No products yet.</p>
                  <button
                    className="dashboard-add-btn"
                    onClick={() => navigate('/seller/products/new')}
                  >
                    + Add your first product
                  </button>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Categories</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map(product => (
                        <tr key={product.id}>

                          {/* Product name with thumbnail */}
                          <td>
                            <div className="dashboard-product-cell">
                              <div className="dashboard-product-thumb">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  '🛍️'
                                )}
                              </div>
                              <span className="dashboard-product-name">
                                {product.name}
                              </span>
                            </div>
                          </td>

                          <td className="product-table-cats">
                            {product.categories.length > 0
                              ? product.categories.join(', ')
                              : '—'}
                          </td>

                          <td>₹{product.price}</td>

                          <td>
                            <span className={`stock-badge ${product.stock === 0 ? 'stock-out' : 'stock-in'}`}>
                              {product.stock === 0 ? 'Out of stock' : product.stock}
                            </span>
                          </td>

                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                            >
                              ✏️ Edit
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ===== RECENT ORDERS ===== */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Recent Orders</h2>
                <button
                  className="dashboard-view-all"
                  onClick={() => navigate('/seller/orders')}
                >
                  View all →
                </button>
              </div>

              {recentOrders.length === 0 ? (
                <div className="dashboard-empty">
                  <p>No orders yet.</p>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr
                          key={order.id}
                          className="dashboard-order-row"
                          onClick={() => navigate('/seller/orders')}
                          title="Go to orders"
                        >
                          <td className="order-id">#{order.id}</td>

                          <td>
                            {order.buyer_info
                              ? order.buyer_info.name
                              : `Buyer #${order.buyer}`}
                          </td>

                          <td>₹{order.total_amount}</td>

                          <td>
                            <span className={`order-status ${statusClass(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>

                          <td className="order-date">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}

      </div>
    </SellerLayout>
  )
}

export default Dashboard