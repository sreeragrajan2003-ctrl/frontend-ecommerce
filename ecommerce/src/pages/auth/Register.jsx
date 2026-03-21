import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

function Register() {
  const navigate = useNavigate()

  // form holds all input values together in one object
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer'       // default role is buyer
  })

  const [error, setError] = useState('')      // shows error message if API fails
  const [success, setSuccess] = useState('')  // shows success message before redirect
  const [loading, setLoading] = useState(false) // disables button while waiting

  // One handler for all inputs — updates only the changed field
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()   // stops page from refreshing on form submit
    setError('')
    setSuccess('')
    setLoading(true)

    // Pick the correct endpoint based on role
    const endpoint = form.role === 'buyer'
      ? '/buyer/register/'
      : '/seller/register/'

    try {
      await api.post(endpoint, form)

      // Show success message first, then redirect after 1.5 seconds
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => {
        navigate(form.role === 'buyer' ? '/login/buyer' : '/login/seller')
      }, 1500)

    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)  // re-enable button whether success or fail
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Commerce today</p>

        {/* Show error or success message if present */}
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>

          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            type="text"
            placeholder="Phone Number (optional)"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Role selector — buyer or seller */}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="buyer">I am a Buyer</option>
            <option value="seller">I am a Seller</option>
          </select>

          {/* disabled while loading so user can't double submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

        </form>

        <div className="auth-links">
          <span>Already have an account? <Link to="/login/buyer">Login here</Link></span>
        </div>

      </div>
    </div>
  )
}

export default Register