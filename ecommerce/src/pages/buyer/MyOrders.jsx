import { useState, useEffect } from 'react'
import api from '../../api/axios'
import BuyerLayout from '../../components/BuyerLayout'

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Tracks which order's items are expanded
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Stores order items fetched per order
  const [orderItems, setOrderItems] = useState({})

  useEffect(() => {
    api.get('/orders/')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  // Fetch items for a specific order when expanded
  async function handleExpandOrder(orderId) {
    if (expandedOrder === orderId) {
      // Collapse if already open
      setExpandedOrder(null)
      return
    }

    setExpandedOrder(orderId)

    // Only fetch if not already fetched
    if (!orderItems[orderId]) {
      try {
        const res = await api.get('/order-items/')
        // Filter items belonging to this order
        const items = res.data.filter(item => item.order === orderId)
        setOrderItems(prev => ({ ...prev, [orderId]: items }))
      } catch {
        setOrderItems(prev => ({ ...prev, [orderId]: [] }))
      }
    }
  }

  // Return CSS class based on order status for color coding
  function statusClass(status) {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'shipped': return 'status-shipped'
      case 'delivered': return 'status-delivered'
      case 'cancelled': return 'status-cancelled'
      default: return ''
    }
  }

  return (
    <BuyerLayout>
      <div className="orders-container">

        <h1 className="orders-title">My Orders</h1>

        {loading && <p className="loading-text">Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p className="empty-text">You have no orders yet.</p>
        )}

        {!loading && orders.map(order => (
          <div key={order.id} className="order-card">

            {/* Order header — always visible */}
            <div
              className="order-header"
              onClick={() => handleExpandOrder(order.id)}
            >
              <div className="order-header-left">
                <span className="order-id">Order #{order.id}</span>
                <span className={`order-status ${statusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-header-right">
                <span className="order-total">₹{order.total_amount}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="order-expand">
                  {expandedOrder === order.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Order items — shown when expanded */}
            {expandedOrder === order.id && (
              <div className="order-items">
                {!orderItems[order.id] ? (
                  <p className="loading-text">Loading items...</p>
                ) : orderItems[order.id].length === 0 ? (
                  <p className="empty-text">No items found.</p>
                ) : (
                  orderItems[order.id].map(item => (
                    <div key={item.id} className="order-item">
                      <span className="order-item-name">{item.product}</span>
                      <span className="order-item-qty">Qty: {item.quantity}</span>
                      <span className="order-item-price">₹{item.price}</span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        ))}

      </div>
    </BuyerLayout>
  )
}

export default MyOrders