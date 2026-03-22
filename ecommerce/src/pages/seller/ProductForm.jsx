import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import SellerLayout from '../../components/SellerLayout'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', categories: '',
  })

  // Existing images from backend — list of { id, url }
  const [existingImages, setExistingImages] = useState([])

  // Ids of existing images marked for deletion
  const [deleteImageIds, setDeleteImageIds] = useState([])

  // New image files selected by seller
  const [newImageFiles, setNewImageFiles] = useState([])

  // Preview URLs for newly selected images
  const [newImagePreviews, setNewImagePreviews] = useState([])

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
        // Load existing images list
        setExistingImages(p.images || [])
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // When seller picks new image files
  function handleNewImages(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Add to existing new files list
    setNewImageFiles(prev => [...prev, ...files])

    // Create preview URLs for each new file
    const previews = files.map(f => URL.createObjectURL(f))
    setNewImagePreviews(prev => [...prev, ...previews])
  }

  // Remove a newly selected image before upload
  function removeNewImage(index) {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Toggle deletion of an existing image
  function toggleDeleteExisting(imgId) {
    setDeleteImageIds(prev =>
      prev.includes(imgId)
        ? prev.filter(i => i !== imgId)   // unmark
        : [...prev, imgId]                // mark for deletion
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('stock', form.stock)
    formData.append('categories', form.categories)

    // ✅ Append each new image file with key 'images'
    newImageFiles.forEach(file => {
      formData.append('images', file)
    })

    // ✅ Send ids of images to delete as comma separated string
    if (deleteImageIds.length > 0) {
      formData.append('delete_images', deleteImageIds.join(','))
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
              <span className="form-hint">Separate multiple categories with a comma</span>
            </div>

            {/* ✅ Images section */}
            <div className="form-group">
              <label>Product Images</label>

              {/* Existing images — shown when editing */}
              {existingImages.length > 0 && (
                <div className="image-gallery">
                  {existingImages.map(img => (
                    <div
                      key={img.id}
                      className={`image-gallery-item ${deleteImageIds.includes(img.id) ? 'image-marked-delete' : ''}`}
                    >
                      <img src={img.url} alt="product" className="gallery-img" />
                      <button
                        type="button"
                        className="gallery-delete-btn"
                        onClick={() => toggleDeleteExisting(img.id)}
                      >
                        {deleteImageIds.includes(img.id) ? '↩ Undo' : '🗑️ Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New image previews */}
              {newImagePreviews.length > 0 && (
                <div className="image-gallery" style={{ marginTop: '0.75rem' }}>
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="image-gallery-item">
                      <img src={preview} alt="new" className="gallery-img" />
                      <button
                        type="button"
                        className="gallery-delete-btn"
                        onClick={() => removeNewImage(index)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File input — multiple allowed */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImages}
                className="image-input"
                style={{ marginTop: '0.75rem' }}
              />
              <span className="form-hint">You can select multiple images at once</span>
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
                {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </SellerLayout>
  )
}

export default ProductForm