import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SellerLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  // All sidebar navigation links
  const links = [
    { to: '/seller/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/seller/products', icon: '📦', label: 'My Products' },
    { to: '/seller/orders',   icon: '🧾', label: 'Orders' },
    { to: '/seller/account',  icon: '👤', label: 'Account' },
  ]

  function handleLogout() {
    logout()
    navigate('/login/seller')
  }

  return (
    <div className="seller-wrapper">

      {/* Left sidebar */}
      <aside className="seller-sidebar">

        {/* Company name at top of sidebar */}
        <div className="seller-sidebar-logo">Commerce</div>

        {/* Navigation links */}
        <nav className="seller-nav">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`seller-nav-link ${location.pathname === link.to ? 'seller-nav-active' : ''}`}
            >
              <span className="seller-nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout at bottom of sidebar */}
        <div className="seller-sidebar-footer">
          <button className="seller-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

      </aside>

      {/* Right main content area */}
      <main className="seller-main">
        {children}
      </main>

    </div>
  )
}

export default SellerLayout