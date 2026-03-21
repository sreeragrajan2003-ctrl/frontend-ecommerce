import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import BuyerLayout from '../../components/BuyerLayout'

function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [addressForm, setAddressForm] = useState({
    full_name: '', phone: '', address_line: '',
    city: '', state: '', pincode: '', country: ''
  })

  // Fetch saved addresses when page loads
  useEffect(() => {
    api.get('/address/')
      .then(res => setAddresses(res.data))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false))
  }, [])

  // Save new address
  async function handleAddAddress(e) {
    e.preventDefault()
    try {
      await api.post('/address/create/', addressForm)
      const res = await api.get('/address/')
      setAddresses(res.data)
      setShowForm(false)
      setAddressForm({
        full_name: '', phone: '', address_line: '',
        city: '', state: '', pincode: '', country: ''
      })
    } catch {
      alert('Failed to save address.')
    }
  }

  // Delete an address
  async function handleDeleteAddress(id) {
    if (!window.confirm('Delete this address?')) return
    try {
      await api.delete(`/address/delete/${id}/`)
      setAddresses(addresses.filter(a => a.id !== id))
    } catch {
      alert('Failed to delete address.')
    }
  }

  function handleFormChange(e) {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value })
  }

  // Logout and go to login page
  function handleLogout() {
    logout()
    navigate('/login/buyer')
  }

  return (
    <BuyerLayout>
      <div className="account-container">

        {/* Profile card */}
        <div className="account-card">
          <h2 className="account-section-title">My Profile</h2>

          <div className="account-info">
            <div className="account-info-row">
              <span className="account-label">Email</span>
              <span className="account-value">{user?.email}</span>
            </div>
            <div className="account-info-row">
              <span className="account-label">Role</span>
              <span className="account-value account-role">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* Addresses card */}
        <div className="account-card">

          <div className="account-card-header">
            <h2 className="account-section-title">My Addresses</h2>
            <button
              className="add-address-btn"
              onClick={() => setShowForm(prev => !prev)}
            >
              {showForm ? 'Cancel' : '+ Add Address'}
            </button>
          </div>

          {/* Add address form — shown only when showForm is true */}
          {showForm && (
            <form className="address-form" onSubmit={handleAddAddress}>
              <input name="full_name" placeholder="Full Name"
                value={addressForm.full_name}
                onChange={handleFormChange} required />
              <input name="phone" placeholder="Phone"
                value={addressForm.phone}
                onChange={handleFormChange} required />
              <input name="address_line" placeholder="Address Line"
                value={addressForm.address_line}
                onChange={handleFormChange} required />
              <input name="city" placeholder="City"
                value={addressForm.city}
                onChange={handleFormChange} required />
              <input name="state" placeholder="State"
                value={addressForm.state}
                onChange={handleFormChange} required />
              <input name="pincode" placeholder="Pincode"
                value={addressForm.pincode}
                onChange={handleFormChange} required />
              <input name="country" placeholder="Country"
                value={addressForm.country}
                onChange={handleFormChange} required />
              <button type="submit" className="save-address-btn">
                Save Address
              </button>
            </form>
          )}

          {loading && <p className="loading-text">Loading...</p>}

          {!loading && addresses.length === 0 && !showForm && (
            <p className="empty-text">No addresses saved yet.</p>
          )}

          {/* List of saved addresses */}
          {addresses.map(addr => (
            <div key={addr.id} className="address-card">
              <div className="address-details">
                <p className="address-name">{addr.full_name}</p>
                <p className="address-line">{addr.address_line}</p>
                <p className="address-line">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <p className="address-line">{addr.country}</p>
                <p className="address-phone">📞 {addr.phone}</p>
              </div>
              <button
                className="delete-address-btn"
                onClick={() => handleDeleteAddress(addr.id)}
              >
                🗑️
              </button>
            </div>
          ))}

        </div>

      </div>
    </BuyerLayout>
  )
}

export default Account