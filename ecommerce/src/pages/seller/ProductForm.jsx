import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: '',
  })

  // Stores the existing image URL when editing
  const [existingImage, setExistingImage] = useState(null)

  // Stores the new image file selected by seller
  const [imageFile, setImageFile] = useState(null)

  // Preview URL for the newly selected image
  const [imagePreview, setImagePreview] = useState(null)

  // Whether seller wants to delete the existing image
  const [deleteImage, setDeleteImage] = useState(false)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
          categories: p.categories.join(', '),
        })
        // Save existing image URL to show as preview
        setExistingImage(p.image)
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // When seller picks an image file
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setDeleteImage(false)
    // Create a local preview URL so seller can see the image
    setImagePreview(URL.createObjectURL(file))
  }

  // When seller clicks delete image
  function handleDeleteImage() {
    setDeleteImage(true)
    setImageFile(null)
    setImagePreview(null)
    setExistingImage(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    // ✅ Use FormData instead of JSON
    // This is required for file uploads
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('stock', form.stock)
    formData.append('categories', form.categories)

    // Append image file if selected
    if (imageFile) {
      formData.append('image', imageFile)
    }

    // Tell backend to delete image if seller clicked delete
    if (deleteImage) {
      formData.append('delete_image', 'true')
    }

    try {
      if (isEditing) {
        await api.put(`/product/update/${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/product/create/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
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
              <input
                name="categories"
                placeholder="e.g. Electronics, Sale"
                value={form.categories}
                onChange={handleChange}
              />
              <span className="form-hint">
                Separate multiple categories with a comma
              </span>
            </div>

            {/* ✅ Image upload section */}
            <div className="form-group">
              <label>Product Image</label>

              {/* Show existing or new preview */}
              {(imagePreview || existingImage) && (
                <div className="image-preview-wrapper">
                  <img
                    src={imagePreview || existingImage}
                    alt="Product preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="delete-image-btn"
                    onClick={handleDeleteImage}
                  >
                    🗑️ Remove Image
                  </button>
                </div>
              )}

              {/* Only show file input if no image selected */}
              {!imagePreview && !existingImage && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
              )}

              {/* Allow replacing image if one exists */}
              {(imagePreview || existingImage) && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
              )}
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