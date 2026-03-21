import { useState, useEffect } from 'react'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState({})
  const [updating, setUpdating] = useState(null)  // tracks which order is being updated

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await api.get('/orders/')
      setOrders(res.data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Expand order to see its items
  async function handleExpand(orderId) {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }
    setExpandedOrder(orderId)

    if (!orderItems[orderId]) {
      try {
        const res = await api.get('/order-items/')
        const items = res.data.filter(item => item.order === orderId)
        setOrderItems(prev => ({ ...prev, [orderId]: items }))
      } catch {
        setOrderItems(prev => ({ ...prev, [orderId]: [] }))
      }
    }
  }

  // Update order status
  // Seller can only go: pending → shipped → delivered
  async function handleStatusUpdate(orderId, newStatus) {
    setUpdating(orderId)
    try {
      await api.put(`/orders/update/${orderId}/`, { status: newStatus })
      // Update status in local state without refetching
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  // What is the next allowed status for this order
  function nextStatus(currentStatus) {
    if (currentStatus === 'pending') return 'shipped'
    if (currentStatus === 'shipped') return 'delivered'
    return null   // delivered has no next step
  }

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
    <SellerLayout>
      <div className="seller-page-container">

        <h1 className="seller-page-title">Orders</h1>

        {loading && <p className="loading-text">Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p className="empty-text">No orders yet.</p>
        )}

        {!loading && orders.map(order => (
          <div key={order.id} className="order-card">

            {/* Order header */}
            <div className="order-header">

              <div
                className="order-header-left"
                onClick={() => handleExpand(order.id)}
                style={{ cursor: 'pointer', flex: 1 }}
              >
                <span className="order-id">Order #{order.id}</span>
                <span className={`order-status ${statusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-header-right">
                <span className="order-total">₹{order.total_amount}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>

                {/* Status update button — only shows if there is a next step */}
                {nextStatus(order.status) && (
                  <button
                    className="status-update-btn"
                    onClick={() => handleStatusUpdate(order.id, nextStatus(order.status))}
                    disabled={updating === order.id}
                  >
                    {updating === order.id
                      ? 'Updating...'
                      : `Mark as ${nextStatus(order.status)}`}
                  </button>
                )}

                <span
                  className="order-expand"
                  onClick={() => handleExpand(order.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {expandedOrder === order.id ? '▲' : '▼'}
                </span>
              </div>

            </div>

            {/* Order items when expanded */}
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
    </SellerLayout>
  )
}

export default SellerOrders