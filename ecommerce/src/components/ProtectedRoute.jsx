import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// children = the actual page component we are protecting
// role = 'buyer' or 'seller' — which role is allowed on this page
function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  // If nobody is logged in, send to buyer login
  if (!user) {
    return <Navigate to="/login/buyer" />
  }

  // If logged in but wrong role (e.g. buyer trying seller page)
  // send them to the correct login page
  if (role && user.role !== role) {
    if (role === 'seller') return <Navigate to="/login/seller" />
    return <Navigate to="/login/buyer" />
  }

  // All good — show the actual page
  return children
}

export default ProtectedRoute