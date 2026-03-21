import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SellerLayout from '../../components/SellerLayout'

function SellerAccount() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login/seller')
  }

  return (
    <SellerLayout>
      <div className="seller-page-container">

        <h1 className="seller-page-title">My Account</h1>

        <div className="account-card">
          <h2 className="account-section-title">Profile</h2>

          <div className="account-info">
            <div className="account-info-row">
              <span className="account-label">Email</span>
              <span className="account-value">{user?.email}</span>
            </div>
            <div className="account-info-row">
              <span className="account-label">Role</span>
              <span className="account-value account-role">
                Seller
              </span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

      </div>
    </SellerLayout>
  )
}

export default SellerAccount