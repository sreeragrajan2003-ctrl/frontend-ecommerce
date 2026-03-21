import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import BuyerLayout from '../../components/BuyerLayout'

function Home() {
  const location = useLocation()

  // All products fetched from backend
  const [products, setProducts] = useState([])

  // Loading state — shows loading message while fetching
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

    // If search query exists, pass it to backend
    if (searchQuery) {
      url = `/product/?search=${searchQuery}`
    }

    api.get(url)
      .then(res => {
        let data = res.data

        // If category filter is active, filter on frontend
        // because backend search only supports name/category text search
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

  // Latest 4 products — sorted by id descending (highest id = newest)
  const latestProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4)

  return (
    <BuyerLayout>

      {/* Show active filter if search or category is selected */}
      {(searchQuery || categoryQuery) && (
        <div className="filter-banner">
          {searchQuery && <span>Search results for: <strong>{searchQuery}</strong></span>}
          {categoryQuery && <span>Category: <strong>{categoryQuery}</strong></span>}
          <Link to="/" className="clear-filter">Clear filter</Link>
        </div>
      )}

      {/* Latest products section — only shown on home without filters */}
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

// ProductCard is a small component used inside Home
// Kept in same file since it is only used here
// product = one product object from the API
function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">

      {/* Product image placeholder — we have no image field yet */}
      <div className="product-card-img">
        🛍️
      </div>

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