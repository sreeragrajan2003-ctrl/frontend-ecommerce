import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="notfound-container">
      <h1 className="notfound-code">404</h1>
      <p className="notfound-msg">Oops! Page not found.</p>
      <Link to="/" className="notfound-link">Go back to Home</Link>
    </div>
  )
}

export default NotFound