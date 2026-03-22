import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  // Not logged in at all
  if (!user) {
    // Send to correct login based on which role this page needs
    if (role === 'seller') return <Navigate to="/login/seller" />
    return <Navigate to="/login/buyer" />
  }

  // Logged in but wrong role
  // e.g. buyer trying to access /seller/dashboard
  if (role && user.role !== role) {
    if (user.role === 'seller') {
      // Seller trying buyer page — send to seller dashboard
      return <Navigate to="/seller/dashboard" />
    }
    if (user.role === 'buyer') {
      // Buyer trying seller page — send to buyer home
      return <Navigate to="/" />
    }
  }

  // All good — show the page
  return children
}

export default ProtectedRoute