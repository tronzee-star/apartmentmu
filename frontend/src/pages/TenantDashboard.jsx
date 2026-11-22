import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Calendar, MessageSquare, Heart, Search, Clock, CheckCircle, XCircle } from 'lucide-react'

const TenantDashboard = () => {
  const { user } = useAuth()
  const [viewingRequests, setViewingRequests] = useState([])
  const [savedProperties, setSavedProperties] = useState([])
  const [activeTab, setActiveTab] = useState('viewings')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [viewingsRes, savedRes] = await Promise.all([
        api.get('/viewing-requests/tenant'),
        api.get('/saved')
      ])
      setViewingRequests(viewingsRes.data.viewing_requests)
      setSavedProperties(savedRes.data.properties)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'rescheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-5 w-5" />
      case 'declined': return <XCircle className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.full_name}</h1>
        <p className="text-gray-600">Manage your rental search and viewings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-full p-3 mr-4">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{viewingRequests.length}</div>
              <div className="text-gray-600">Viewing Requests</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{savedProperties.length}</div>
              <div className="text-gray-600">Saved Properties</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <Link to="/messages" className="text-2xl font-bold text-primary-600 hover:underline">
                View Messages
              </Link>
              <div className="text-gray-600">Communicate with landlords</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('viewings')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'viewings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-5 w-5 inline mr-2" />
              Viewing Requests
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'saved'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className="h-5 w-5 inline mr-2" />
              Saved Properties
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'viewings' && (
            <>
              {viewingRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-4">No viewing requests yet</p>
                  <Link to="/search" className="btn-primary inline-flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link
                            to={`/property/${request.property_id}`}
                            className="font-semibold text-lg hover:text-primary-600"
                          >
                            Property #{request.property_id}
                          </Link>
                          <div className="text-gray-600 text-sm mt-1">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-2 capitalize">{request.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Preferred Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(request.preferred_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Preferred Time:</span>
                          <span className="ml-2 font-medium">{request.preferred_time}</span>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div className="mt-3 text-sm">
                          <span className="text-gray-600">Message:</span>
                          <p className="mt-1 text-gray-800">{request.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedProperties.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-4">No saved properties yet</p>
                  <Link to="/search" className="btn-primary inline-flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProperties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/property/${property.id}`}
                      className="card hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={property.images?.[0] || '/placeholder-house.jpg'}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-1">{property.title}</h3>
                        <div className="text-gray-600 text-sm mb-2">{property.location}</div>
                        <div className="text-xl font-bold text-primary-600">
                          KES {property.monthly_rent.toLocaleString()}/month
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TenantDashboard
