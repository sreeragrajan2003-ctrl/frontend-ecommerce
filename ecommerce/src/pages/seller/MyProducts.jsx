import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function MyProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const res = await api.get('/product/my/')
      setProducts(res.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Delete a product
  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/product/delete/${id}/`)
      // Remove from list without refetching
      setProducts(products.filter(p => p.id !== id))
    } catch {
      alert('Failed to delete product.')
    }
  }

  return (
    <SellerLayout>
      <div className="seller-page-container">

        {/* Header with Add Product button */}
        <div className="seller-page-header">
          <h1 className="seller-page-title">My Products</h1>
          <Link to="/seller/products/new" className="add-product-btn">
            + Add Product
          </Link>
        </div>

        {loading && <p className="loading-text">Loading products...</p>}

        {!loading && products.length === 0 && (
          <div className="seller-empty">
            <p>You have no products yet.</p>
            <Link to="/seller/products/new" className="add-product-btn">
              Add Your First Product
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Categories</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="product-table-name">{product.name}</td>
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
                    <td className="product-table-actions">
                      {/* Edit — goes to ProductForm with this product's id */}
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                      >
                        ✏️ Edit
                      </button>
                      {/* Delete */}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </SellerLayout>
  )
}

export default MyProducts