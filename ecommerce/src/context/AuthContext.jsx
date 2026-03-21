import { createContext, useContext, useState } from 'react'

// Step 1: Create the context (like a global variable container)
const AuthContext = createContext()

export function AuthProvider({ children }) {

  // Step 2: Load user from localStorage on first load
  // So if the user refreshes the page, they stay logged in
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  // Step 3: login() — saves user + tokens to localStorage and state
  // Called after a successful login API response
  function login(userData, tokens) {
    localStorage.setItem('access', tokens.access)
    localStorage.setItem('refresh', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  // Step 4: logout() — clears everything
  // Called when user clicks logout
  function logout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Step 5: Provide user, login, logout to the whole app
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 6: Custom hook so any component can do: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}