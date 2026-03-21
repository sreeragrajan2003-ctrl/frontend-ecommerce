import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function LoginSeller() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1 — send credentials to backend
      const res = await api.post('/seller/login/', form)

      // Step 2 — save tokens temporarily
      localStorage.setItem('access', res.data.tokens.access)
      localStorage.setItem('refresh', res.data.tokens.refresh)

      // Step 3 — get logged in user info
      const userRes = await api.get('/protected/')

      // Step 4 — save to context
      login(
        {
          email: userRes.data.user,
          role: userRes.data.role,
        },
        res.data.tokens
      )

      // Step 5 — seller goes to dashboard
      navigate('/seller/dashboard')

    } catch {
      setError('Invalid email or password.')
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h2>Seller Login</h2>
        <p className="auth-subtitle">Manage your Commerce store</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <span>Don't have an account? <Link to="/register">Register</Link></span>
          <span>Are you a buyer? <Link to="/login/buyer">Buyer Login</Link></span>
        </div>

      </div>
    </div>
  )
}

export default LoginSeller