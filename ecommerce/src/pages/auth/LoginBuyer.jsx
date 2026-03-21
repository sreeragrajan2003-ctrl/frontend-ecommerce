import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function LoginBuyer() {
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
      // Step 1 — send email and password to backend, get tokens back
      const res = await api.post('/buyer/login/', form)

      // Step 2 — save tokens to localStorage temporarily
      // We need this so the next API call includes the token
      localStorage.setItem('access', res.data.tokens.access)
      localStorage.setItem('refresh', res.data.tokens.refresh)

      // Step 3 — call /protected/ to get the logged in user's info
      const userRes = await api.get('/protected/')

      // Step 4 — save user info + tokens to AuthContext
      // Now any page can access user.email and user.role
      login(
        {
          email: userRes.data.user,
          role: userRes.data.role,
        },
        res.data.tokens
      )

      // Step 5 — go to home page
      navigate('/')

    } catch {
      setError('Invalid email or password.')
      // Clean up tokens if login failed
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h2>Buyer Login</h2>
        <p className="auth-subtitle">Welcome back to Commerce</p>

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
          <span>Are you a seller? <Link to="/login/seller">Seller Login</Link></span>
        </div>

      </div>
    </div>
  )
}

export default LoginBuyer