import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import BuyerLayout from '../../components/BuyerLayout'

function Checkout() {
  const navigate = useNavigate()

  // List of buyer's saved addresses
  const [addresses, setAddresses] = useState([])

  // Which address is selected
  const [selectedAddress, setSelectedAddress] = useState(null)

  // Cart summary shown on checkout page
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState('0')

  // Form for adding a new address inline
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    full_name: '', phone: '', address_line: '',
    city: '', state: '', pincode: '', country: ''
  })

  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  // Load addresses and cart together when page opens
  useEffect(() => {
    async function loadData() {
      try {
        const [addrRes, cartRes] = await Promise.all([
          api.get('/address/'),
          api.get('/cart/')
        ])
        setAddresses(addrRes.data)
        setCartItems(cartRes.data.items)
        setTotal(cartRes.data.total_amount)

        // Auto-select first address if available
        if (addrRes.data.length > 0) {
          setSelectedAddress(addrRes.data[0].id)
        }
      } catch {
        setError('Failed to load checkout data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Add a new address from the inline form
  async function handleAddAddress(e) {
    e.preventDefault()
    try {
      const res = await api.post('/address/create/', addressForm)
      // Refresh addresses after adding
      const addrRes = await api.get('/address/')
      setAddresses(addrRes.data)
      setSelectedAddress(res.data.id)
      setShowAddressForm(false)
    } catch {
      alert('Failed to save address.')
    }
  }

  function handleAddressFormChange(e) {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value })
  }

  // Place the order
  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError('Please select a delivery address.')
      return
    }

    setPlacing(true)
    setError('')

    try {
      await api.post('/checkout/', {
        shipping_address_id: selectedAddress
      })
      // Order placed — go to orders page
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <BuyerLayout>
        <p className="loading-text">Loading checkout...</p>
      </BuyerLayout>
    )
  }

  return (
    <BuyerLayout>
      <div className="checkout-container">

        <h1 className="checkout-title">Checkout</h1>

        {error && <div className="error-msg">{error}</div>}

        <div className="checkout-layout">

          {/* Left — Delivery address */}
          <div className="checkout-left">
            <h2 className="checkout-section-title">Delivery Address</h2>

            {addresses.length === 0 && !showAddressForm && (
              <p className="empty-text">No addresses saved yet.</p>
            )}

            {/* Address cards */}
            {addresses.map(addr => (
              <div
                key={addr.id}
                className={`address-card ${selectedAddress === addr.id ? 'address-selected' : ''}`}
                onClick={() => setSelectedAddress(addr.id)}
              >
                <div className="address-radio">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                  />
                </div>
                <div className="address-details">
                  <p className="address-name">{addr.full_name}</p>
                  <p className="address-line">{addr.address_line}</p>
                  <p className="address-line">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p className="address-line">{addr.country}</p>
                  <p className="address-phone">📞 {addr.phone}</p>
                </div>
              </div>
            ))}

            {/* Toggle add address form */}
            {!showAddressForm && (
              <button
                className="add-address-btn"
                onClick={() => setShowAddressForm(true)}
              >
                + Add New Address
              </button>
            )}

            {/* Inline add address form */}
            {showAddressForm && (
              <form
                className="address-form"
                onSubmit={handleAddAddress}
              >
                <h3>New Address</h3>
                <input name="full_name" placeholder="Full Name"
                  value={addressForm.full_name}
                  onChange={handleAddressFormChange} required />
                <input name="phone" placeholder="Phone"
                  value={addressForm.phone}
                  onChange={handleAddressFormChange} required />
                <input name="address_line" placeholder="Address Line"
                  value={addressForm.address_line}
                  onChange={handleAddressFormChange} required />
                <input name="city" placeholder="City"
                  value={addressForm.city}
                  onChange={handleAddressFormChange} required />
                <input name="state" placeholder="State"
                  value={addressForm.state}
                  onChange={handleAddressFormChange} required />
                <input name="pincode" placeholder="Pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressFormChange} required />
                <input name="country" placeholder="Country"
                  value={addressForm.country}
                  onChange={handleAddressFormChange} required />
                <div className="address-form-actions">
                  <button type="submit" className="save-address-btn">
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right — Order summary */}
          <div className="checkout-right">
            <h2 className="checkout-section-title">Order Summary</h2>

            <div className="checkout-items">
              {cartItems.map(item => (
                <div key={item.cart_id} className="checkout-item">
                  <span className="checkout-item-name">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="checkout-item-price">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <p className="cod-note">💳 Payment: Cash on Delivery</p>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>

        </div>
      </div>
    </BuyerLayout>
  )
}

export default Checkout