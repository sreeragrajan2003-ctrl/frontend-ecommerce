import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './styles/auth.css'
import './styles/navbar.css'
import './styles/footer.css'
import './styles/home.css'
import './styles/product.css'
import './styles/cart.css'
import './styles/checkout.css'
import './styles/orders.css'
import './styles/account.css'
import './styles/seller.css'    // ✅ add this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)