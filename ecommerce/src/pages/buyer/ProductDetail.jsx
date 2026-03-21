import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import BuyerLayout from '../../components/BuyerLayout'

function ProductDetail() {
  const { id } = useParams()       // Get product id from URL e.g. /product/3
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [cartMsg, setCartMsg] = useState('')   // success or error message after add to cart
  const [cartLoading, setCartLoading] = useState(false)

  // Fetch single product from backend when page loads
  useEffect(() => {
    api.get(`/product/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  // Add product to cart
  async function handleAddToCart() {

    // If not logged in, send to login page
    if (!user) {
      navigate('/login/buyer')
      return
    }

    // Only buyers can add to cart
    if (user.role !== 'buyer') {
      setCartMsg('Only buyers can add to cart.')
      return
    }

    setCartLoading(true)
    setCartMsg('')

    try {
      await api.post('/cart/add/', {
        product_id: product.id,
        quantity: quantity
      })
      setCartMsg('Added to cart successfully!')
    } catch (err) {
      setCartMsg(err.response?.data?.error || 'Failed to add to cart.')
    } finally {
      setCartLoading(false)
    }
  }

  if (loading) {
    return (
      <BuyerLayout>
        <p className="loading-text">Loading product...</p>
      </BuyerLayout>
    )
  }

  if (!product) {
    return (
      <BuyerLayout>
        <p className="empty-text">Product not found.</p>
      </BuyerLayout>
    )
  }

  return (
    <BuyerLayout>
      <div className="product-detail-container">

        {/* Left — product image placeholder */}
        <div className="product-detail-img">
          🛍️
        </div>

        {/* Right — product info */}
        <div className="product-detail-info">

          <h1 className="product-detail-name">{product.name}</h1>

          <p className="product-detail-categories">
            {product.categories.join(', ')}
          </p>

          <p className="product-detail-price">₹{product.price}</p>

          <p className="product-detail-desc">
            {product.description || 'No description provided.'}
          </p>

          <p className={`product-detail-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
            {product.stock === 0
              ? 'Out of stock'
              : `${product.stock} items available`}
          </p>

          {/* Quantity selector — only show if in stock */}
          {product.stock > 0 && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
          )}

          {/* Add to cart button */}
          {product.stock > 0 && (
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={cartLoading}
            >
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          )}

          {/* Success or error message after adding to cart */}
          {cartMsg && (
            <p className={`cart-msg ${cartMsg.includes('success') ? 'cart-msg-success' : 'cart-msg-error'}`}>
              {cartMsg}
            </p>
          )}

          {/* If not logged in show login prompt */}
          {!user && (
            <p className="login-prompt">
              <Link to="/login/buyer">Login</Link> to add to cart
            </p>
          )}

        </div>
      </div>
    </BuyerLayout>
  )
}

export default ProductDetail