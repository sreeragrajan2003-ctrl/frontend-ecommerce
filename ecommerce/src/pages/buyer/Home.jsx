import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import BuyerLayout from '../../components/BuyerLayout'

function Home() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Read search or category from URL
  // e.g. /?search=shoes or /?category=Electronics
  const queryParams = new URLSearchParams(location.search)
  const searchQuery = queryParams.get('search') || ''
  const categoryQuery = queryParams.get('category') || ''

  // Fetch products whenever the URL query changes
  useEffect(() => {
    setLoading(true)
    let url = '/product/'
    if (searchQuery) url = `/product/?search=${searchQuery}`

    api.get(url)
      .then(res => {
        let data = res.data

        // Filter by category on frontend if category is selected
        if (categoryQuery) {
          data = data.filter(p =>
            p.categories.some(c =>
              c.toLowerCase() === categoryQuery.toLowerCase()
            )
          )
        }

        setProducts(data)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchQuery, categoryQuery])

  // Latest 4 products — highest id = newest
  const latestProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4)

  return (
    <BuyerLayout>

      {/* Filter banner — shown when search or category is active */}
      {(searchQuery || categoryQuery) && (
        <div className="filter-banner">
          {searchQuery && (
            <span>Search results for: <strong>{searchQuery}</strong></span>
          )}
          {categoryQuery && (
            <span>Category: <strong>{categoryQuery}</strong></span>
          )}
          <Link to="/" className="clear-filter">Clear filter</Link>
        </div>
      )}

      {/* Latest products — only shown on home page without filters */}
      {!searchQuery && !categoryQuery && (
        <section className="home-section">
          <h2 className="section-title">Latest Products</h2>

          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : latestProducts.length === 0 ? (
            <p className="empty-text">No products yet.</p>
          ) : (
            <div className="product-grid">
              {latestProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* All products section */}
      <section className="home-section">
        <h2 className="section-title">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : categoryQuery
            ? `${categoryQuery} Products`
            : 'All Products'}
        </h2>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : products.length === 0 ? (
          <p className="empty-text">No products found.</p>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </BuyerLayout>
  )
}

// ✅ Single ProductCard — shows first image from images array
// If no image uploaded, shows emoji placeholder
function ProductCard({ product }) {

  // Pick the first image from the images array
  // images is now a list of { id, url } objects
  const firstImage = product.images && product.images.length > 0
    ? product.images[0].url
    : null

  return (
    <Link to={`/product/${product.id}`} className="product-card">

      {/* Product image — real or emoji fallback */}
      <div className="product-card-img">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          '🛍️'
        )}
      </div>

      {/* Product info */}
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-categories">
          {product.categories.join(', ')}
        </p>
        <p className="product-card-price">₹{product.price}</p>
        <p className={`product-card-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
          {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
        </p>
      </div>

    </Link>
  )
}

export default Home