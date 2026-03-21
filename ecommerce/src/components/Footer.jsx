import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Footer() {
  const { user } = useAuth()
  const location = useLocation()

  // Current URL path — used to highlight the active footer link
  const path = location.pathname

  // Point to correct page based on role
  const ordersPath = user?.role === 'seller' ? '/seller/orders' : '/orders'
  const accountPath = user?.role === 'seller' ? '/seller/account' : '/account'

  return (
    <footer className="footer">

      <Link
        to="/"
        className={`footer-item ${path === '/' ? 'footer-active' : ''}`}
      >
        <span className="footer-icon">🏠</span>
        <span className="footer-label">Home</span>
      </Link>

      <Link
        to={ordersPath}
        className={`footer-item ${path.includes('orders') ? 'footer-active' : ''}`}
      >
        <span className="footer-icon">📦</span>
        <span className="footer-label">Orders</span>
      </Link>

      <Link
        to={accountPath}
        className={`footer-item ${path.includes('account') ? 'footer-active' : ''}`}
      >
        <span className="footer-icon">👤</span>
        <span className="footer-label">Account</span>
      </Link>

    </footer>
  )
}

export default Footer