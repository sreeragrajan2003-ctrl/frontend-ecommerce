import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Register from './pages/auth/Register'
import LoginBuyer from './pages/auth/LoginBuyer'
import LoginSeller from './pages/auth/LoginSeller'

import Home from './pages/buyer/Home'
import ProductDetail from './pages/buyer/ProductDetail'
import Cart from './pages/buyer/Cart'
import Checkout from './pages/buyer/Checkout'
import MyOrders from './pages/buyer/MyOrders'
import Account from './pages/buyer/Account'

import Dashboard from './pages/seller/Dashboard'
import MyProducts from './pages/seller/MyProducts'
import ProductForm from './pages/seller/ProductForm'
import SellerOrders from './pages/seller/SellerOrders'
import SellerAccount from './pages/seller/SellerAccount'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Auth */}
          <Route path="/register" element={<Register />} />
          <Route path="/login/buyer" element={<LoginBuyer />} />
          <Route path="/login/seller" element={<LoginSeller />} />

          {/* Buyer public */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Buyer protected */}
          <Route path="/cart" element={
            <ProtectedRoute role="buyer"><Cart /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute role="buyer"><MyOrders /></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute role="buyer"><Account /></ProtectedRoute>
          } />

          {/* Seller protected */}
          <Route path="/seller/dashboard" element={
            <ProtectedRoute role="seller"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/seller/products" element={
            <ProtectedRoute role="seller"><MyProducts /></ProtectedRoute>
          } />
          <Route path="/seller/products/new" element={
            <ProtectedRoute role="seller"><ProductForm /></ProtectedRoute>
          } />
          <Route path="/seller/products/edit/:id" element={
            <ProtectedRoute role="seller"><ProductForm /></ProtectedRoute>
          } />
          <Route path="/seller/orders" element={
            <ProtectedRoute role="seller"><SellerOrders /></ProtectedRoute>
          } />
          <Route path="/seller/account" element={
            <ProtectedRoute role="seller"><SellerAccount /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App