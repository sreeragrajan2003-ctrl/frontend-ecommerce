import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import BuyerLayout from '../../components/BuyerLayout'

function ProductDetail() {
  const { id } = useParams()      // product id from URL e.g. /product/3
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [cartMsg, setCartMsg] = useState('')
  const [cartLoading, setCartLoading] = useState(false)

  // Which image is currently shown in the main viewer
  // index into product.images array
  const [selectedImage, setSelectedImage] = useState(0)

  // Fetch product when page loads
  useEffect(() => {
    api.get(`/product/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImage(0)
  }, [product])

  // Add to cart
  async function handleAddToCart() {

    // Not logged in — send to login
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

  // Determine if product has images
  const hasImages = product.images && product.images.length > 0

  return (
    <BuyerLayout>
      <div className="product-detail-container">

        {/* ===== LEFT — Image gallery ===== */}
        <div className="product-detail-images">

          {/* Main large image viewer */}
          <div className="product-detail-main-img">
            {hasImages ? (
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
              />
            ) : (
              // No image uploaded — show emoji
              <span style={{ fontSize: '6rem' }}>🛍️</span>
            )}
          </div>

          {/* Thumbnail row — only shown when more than 1 image */}
          {hasImages && product.images.length > 1 && (
            <div className="product-thumbnail-row">
              {product.images.map((img, index) => (
                <div
                  key={img.id}
                  className={`product-thumbnail ${selectedImage === index ? 'thumbnail-active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img.url}
                    alt={`view ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ===== RIGHT — Product info ===== */}
        <div className="product-detail-info">

          <h1 className="product-detail-name">{product.name}</h1>

          {/* Categories */}
          <p className="product-detail-categories">
            {product.categories.join(', ')}
          </p>

          {/* Price */}
          <p className="product-detail-price">₹{product.price}</p>

          {/* Description */}
          <p className="product-detail-desc">
            {product.description || 'No description provided.'}
          </p>

          {/* Stock */}
          <p className={`product-detail-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
            {product.stock === 0
              ? 'Out of stock'
              : `${product.stock} items available`}
          </p>

          {/* Quantity selector — only if in stock */}
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

          {/* Add to cart button — only if in stock */}
          {product.stock > 0 && (
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={cartLoading}
            >
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          )}

          {/* Cart success or error message */}
          {cartMsg && (
            <p className={`cart-msg ${cartMsg.includes('success') ? 'cart-msg-success' : 'cart-msg-error'}`}>
              {cartMsg}
            </p>
          )}

          {/* Login prompt if not logged in */}
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