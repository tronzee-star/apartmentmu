import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Search, MessageSquare, Heart, LogOut, User, Plus } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">PropertyConnect</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-primary-600 transition-colors">
              Search
            </Link>
            
            {user ? (
              <>
                {user.user_type === 'tenant' && (
                  <>
                    <Link to="/saved" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center">
                      <Heart className="h-5 w-5 mr-1" />
                      Saved
                    </Link>
                  </>
                )}
                <Link to="/messages" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center">
                  <MessageSquare className="h-5 w-5 mr-1" />
                  Messages
                </Link>
                <Link 
                  to={`/${user.user_type}/dashboard`}
                  className="text-gray-700 hover:text-primary-600 transition-colors flex items-center"
                >
                  <User className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 transition-colors flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button would go here */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
