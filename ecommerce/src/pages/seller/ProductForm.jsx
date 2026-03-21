import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function ProductForm() {
  const { id } = useParams()   // id exists when editing, undefined when creating
  const navigate = useNavigate()

  const isEditing = Boolean(id)  // true if editing, false if creating

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: '',   // comma separated string e.g. "Electronics, Sale"
  })

  const [loading, setLoading] = useState(isEditing)  // only load if editing
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // If editing — fetch existing product and pre-fill form
  useEffect(() => {
    if (!isEditing) return

    api.get(`/product/${id}/`)
      .then(res => {
        const p = res.data
        setForm({
          name: p.name,
          description: p.description || '',
          price: p.price,
          stock: p.stock,
          // Convert array back to comma separated string for the input
          categories: p.categories.join(', '),
        })
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Convert comma separated categories string to array
    // e.g. "Electronics, Sale" → ["Electronics", "Sale"]
    const categoriesArray = form.categories
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0)

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      categories: categoriesArray,
    }

    try {
      if (isEditing) {
        // Update existing product
        await api.put(`/product/update/${id}/`, payload)
      } else {
        // Create new product
        await api.post('/product/create/', payload)
      }
      // Go back to products list after save
      navigate('/seller/products')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SellerLayout>
        <p className="loading-text">Loading product...</p>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="seller-page-container">

        <div className="seller-page-header">
          <h1 className="seller-page-title">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="product-form-card">
          <form onSubmit={handleSubmit} className="product-form">

            <div className="form-group">
              <label>Product Name</label>
              <input
                name="name"
                placeholder="e.g. Wireless Headphones"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your product..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Categories</label>
              {/* Comma separated — backend splits this into array */}
              <input
                name="categories"
                placeholder="e.g. Electronics, Sale, Featured"
                value={form.categories}
                onChange={handleChange}
              />
              <span className="form-hint">
                Separate multiple categories with a comma
              </span>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/seller/products')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-product-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : isEditing ? 'Update Product' : 'Add Product'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </SellerLayout>
  )
}

export default ProductForm