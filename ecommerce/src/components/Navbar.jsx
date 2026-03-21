import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Navbar() {
  const navigate = useNavigate()

  // Stores list of categories fetched from backend
  const [categories, setCategories] = useState([])

  // Controls whether the dropdown is open or closed
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Stores what user types in search bar
  const [search, setSearch] = useState('')

  // We use this ref to detect clicks outside the dropdown
  // so we can close it automatically
  const dropdownRef = useRef(null)

  // Fetch all categories from backend when navbar loads
  useEffect(() => {
    api.get('/category/')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]))
  }, [])

  // Close dropdown if user clicks anywhere outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // When user submits search form, go to home page with search query
  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?search=${search.trim()}`)
      setSearch('')
    }
  }

  // When user picks a category, go to home page with category filter
  function handleCategoryClick(categoryName) {
    setDropdownOpen(false)
    navigate(`/?category=${categoryName}`)
  }

  return (
    <nav className="navbar">

      {/* Left — Company name links to home */}
      <Link to="/" className="navbar-logo">
        Commerce
      </Link>

      {/* Middle — Search bar */}
      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Right — Categories dropdown + Cart */}
      <div className="navbar-right">

        {/* Categories dropdown */}
        <div className="categories-wrapper" ref={dropdownRef}>
          <button
            className="categories-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            Categories
            <span className="dropdown-arrow">▾</span>
          </button>

          {/* Dropdown list — only shown when dropdownOpen is true */}
          {dropdownOpen && (
            <div className="dropdown-menu">
              {categories.length === 0 ? (
                <p className="dropdown-empty">No categories yet</p>
              ) : (
                categories.map(cat => (
                  <button
                    key={cat.id}
                    className="dropdown-item"
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Cart icon links to cart page */}
        <Link to="/cart" className="cart-link">
          🛒 Cart
        </Link>

      </div>
    </nav>
  )
}

export default Navbar