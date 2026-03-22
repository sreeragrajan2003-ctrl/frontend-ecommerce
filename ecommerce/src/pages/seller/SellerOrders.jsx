import { useState, useEffect } from 'react'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function SellerOrders() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Tracks which order is currently expanded
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Stores fetched items per order — { orderId: [items] }
  const [orderItems, setOrderItems] = useState({})

  // Tracks which order's status is being updated
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  // Fetch all orders that contain this seller's products
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

  // Expand or collapse an order
  // If expanding and items not yet fetched — fetch them
  async function handleExpand(orderId) {

    // Collapse if already open
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }

    setExpandedOrder(orderId)

    // Only fetch items if not already fetched for this order
    if (!orderItems[orderId]) {
      try {
        const res = await api.get('/order-items/')
        // Filter items that belong to this specific order
        const items = res.data.filter(item => item.order === orderId)
        setOrderItems(prev => ({ ...prev, [orderId]: items }))
      } catch {
        setOrderItems(prev => ({ ...prev, [orderId]: [] }))
      }
    }
  }

  // Update order status
  // Seller can only move forward: pending → shipped → delivered
  async function handleStatusUpdate(orderId, newStatus) {
    setUpdating(orderId)
    try {
      await api.put(`/orders/update/${orderId}/`, { status: newStatus })

      // Update status in local state without refetching the whole list
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  // Returns the next allowed status for an order
  // pending → shipped → delivered → null (no more steps)
  function nextStatus(currentStatus) {
    if (currentStatus === 'pending') return 'shipped'
    if (currentStatus === 'shipped') return 'delivered'
    return null
  }

  // Returns CSS class for status color coding
  function statusClass(status) {
    switch (status) {
      case 'pending':   return 'status-pending'
      case 'shipped':   return 'status-shipped'
      case 'delivered': return 'status-delivered'
      case 'cancelled': return 'status-cancelled'
      default:          return ''
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

            {/* ============================
                ORDER HEADER
                Always visible — click to expand
                ============================ */}
            <div className="order-header">

              {/* Left side — order id and status badge */}
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

              {/* Right side — total, date, update button, expand arrow */}
              <div className="order-header-right">

                <span className="order-total">₹{order.total_amount}</span>

                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>

                {/* Status update button
                    Only shown if there is a next step available
                    e.g. pending shows "Mark as shipped"
                         shipped shows "Mark as delivered"
                         delivered shows nothing */}
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

                {/* Expand/collapse arrow */}
                <span
                  className="order-expand"
                  onClick={() => handleExpand(order.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {expandedOrder === order.id ? '▲' : '▼'}
                </span>

              </div>
            </div>

            {/* ============================
                EXPANDED SECTION
                Shows buyer info + address + items
                Only visible when order is expanded
                ============================ */}
            {expandedOrder === order.id && (
              <div className="order-items">

                {/* Buyer details card
                    Shows name, email, phone of the buyer
                    and full shipping address */}
                {order.buyer_info && (
                  <div className="buyer-info-card">

                    {/* Buyer personal info */}
                    <h4 className="buyer-info-title">📋 Buyer Details</h4>

                    <div className="buyer-info-row">
                      <span className="buyer-info-label">Name</span>
                      <span>{order.buyer_info.name}</span>
                    </div>

                    <div className="buyer-info-row">
                      <span className="buyer-info-label">Email</span>
                      <span>{order.buyer_info.email}</span>
                    </div>

                    <div className="buyer-info-row">
                      <span className="buyer-info-label">Phone</span>
                      <span>{order.buyer_info.phone}</span>
                    </div>

                    {/* Shipping address details */}
                    {order.shipping_address && (
                      <>
                        <h4
                          className="buyer-info-title"
                          style={{ marginTop: '1rem' }}
                        >
                          📦 Shipping Address
                        </h4>

                        <div className="buyer-info-row">
                          <span className="buyer-info-label">Name</span>
                          <span>{order.shipping_address.full_name}</span>
                        </div>

                        <div className="buyer-info-row">
                          <span className="buyer-info-label">Phone</span>
                          <span>{order.shipping_address.phone}</span>
                        </div>

                        <div className="buyer-info-row">
                          <span className="buyer-info-label">Address</span>
                          <span>{order.shipping_address.address_line}</span>
                        </div>

                        <div className="buyer-info-row">
                          <span className="buyer-info-label">City</span>
                          <span>
                            {order.shipping_address.city},{' '}
                            {order.shipping_address.state}{' '}
                            — {order.shipping_address.pincode}
                          </span>
                        </div>

                        <div className="buyer-info-row">
                          <span className="buyer-info-label">Country</span>
                          <span>{order.shipping_address.country}</span>
                        </div>
                      </>
                    )}

                    {/* No shipping address saved */}
                    {!order.shipping_address && (
                      <p className="empty-text" style={{ marginTop: '0.5rem' }}>
                        No shipping address provided.
                      </p>
                    )}

                  </div>
                )}

                {/* Items ordered section */}
                <h4 className="buyer-info-title">🛍️ Items Ordered</h4>

                {/* Loading state for items */}
                {!orderItems[order.id] && (
                  <p className="loading-text">Loading items...</p>
                )}

                {/* No items found */}
                {orderItems[order.id] && orderItems[order.id].length === 0 && (
                  <p className="empty-text">No items found.</p>
                )}

                {/* Items list */}
                {orderItems[order.id] && orderItems[order.id].map(item => (
                  <div key={item.id} className="order-item">
                    <span className="order-item-name">{item.product}</span>
                    <span className="order-item-qty">Qty: {item.quantity}</span>
                    <span className="order-item-price">₹{item.price}</span>
                  </div>
                ))}

              </div>
            )}

          </div>
        ))}

      </div>
    </SellerLayout>
  )
}

export default SellerOrders