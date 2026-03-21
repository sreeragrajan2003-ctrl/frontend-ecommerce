import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BuyerLayout from '../../components/BuyerLayout'

function Cart() {
  const navigate = useNavigate()

  // Stores all cart items fetched from backend
  const [cartItems, setCartItems] = useState([])

  // Total amount calculated from items
  const [total, setTotal] = useState('0')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch cart when page loads
  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    setLoading(true)
    try {
      const res = await api.get('/cart/')
      setCartItems(res.data.items)
      setTotal(res.data.total_amount)
    } catch {
      setError('Failed to load cart.')
    } finally {
      setLoading(false)
    }
  }

  // Update quantity of a cart item
  // Called when buyer clicks + or - buttons
  async function handleQuantityChange(cartId, newQty) {
    if (newQty < 1) return
    try {
      await api.put(`/cart/update/${cartId}/`, { quantity: newQty })
      // Refresh cart after update to get new total
      fetchCart()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update quantity.')
    }
  }

  // Remove a single item from cart
  async function handleRemove(cartId) {
    try {
      await api.delete(`/cart/delete/${cartId}/`)
      fetchCart()
    } catch {
      alert('Failed to remove item.')
    }
  }

  // Clear the entire cart
  async function handleClearCart() {
    if (!window.confirm('Clear entire cart?')) return
    try {
      await api.delete('/cart/clear/')
      setCartItems([])
      setTotal('0')
    } catch {
      alert('Failed to clear cart.')
    }
  }

  return (
    <BuyerLayout>
      <div className="cart-container">

        <h1 className="cart-title">My Cart</h1>

        {loading && <p className="loading-text">Loading cart...</p>}
        {error && <p className="empty-text">{error}</p>}

        {!loading && cartItems.length === 0 && (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/" className="continue-shopping">Browse Products</Link>
          </div>
        )}

        {!loading && cartItems.length > 0 && (
          <>
            {/* Cart items list */}
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.cart_id} className="cart-item">

                  {/* Product image placeholder */}
                  <div className="cart-item-img">🛍️</div>

                  {/* Product info */}
                  <div className="cart-item-info">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="cart-item-name"
                    >
                      {item.product_name}
                    </Link>
                    <p className="cart-item-price">₹{item.price} each</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="cart-item-qty">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.cart_id, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.cart_id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal for this item */}
                  <p className="cart-item-subtotal">₹{item.subtotal}</p>

                  {/* Remove button */}
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(item.cart_id)}
                  >
                    🗑️
                  </button>

                </div>
              ))}
            </div>

            {/* Cart summary */}
            <div className="cart-summary">
              <div className="cart-total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <div className="cart-actions">
                <button
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>

                <button
                  className="checkout-btn"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </BuyerLayout>
  )
}

export default Cart