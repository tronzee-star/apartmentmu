import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Users, Home, Shield, CheckCircle, XCircle, ToggleLeft, ToggleRight, Trash2, BarChart3 } from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.user_type !== 'admin') {
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, propsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/properties')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users)
      setProperties(propsRes.data.properties)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyLandlord = async (userId, isVerified) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { is_verified: !isVerified })
      fetchData()
    } catch (error) {
      console.error('Error updating verification:', error)
    }
  }

  const handleTogglePropertyActive = async (propertyId) => {
    try {
      await api.put(`/admin/properties/${propertyId}/toggle-active`)
      fetchData()
    } catch (error) {
      console.error('Error toggling property:', error)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    
    try {
      await api.delete(`/admin/properties/${propertyId}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, properties, and platform content</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'stats'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-5 w-5 inline mr-2" />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'properties'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="h-5 w-5 inline mr-2" />
              Properties
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-full p-3 mr-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <div className="text-gray-600">Total Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_landlords}</div>
                <div className="text-gray-600">Landlords</div>
                <div className="text-sm text-gray-500">{stats.verified_landlords} verified</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_properties}</div>
                <div className="text-gray-600">Properties</div>
                <div className="text-sm text-gray-500">{stats.active_properties} active</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.vacant_properties}</div>
                <div className="text-gray-600">Vacant Properties</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Verified</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{userItem.full_name}</td>
                        <td className="py-3 px-4 text-gray-600">{userItem.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userItem.user_type === 'landlord' 
                              ? 'bg-blue-100 text-blue-800' 
                              : userItem.user_type === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userItem.user_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {userItem.user_type === 'landlord' && (
                            <button
                              onClick={() => handleVerifyLandlord(userItem.id, userItem.is_verified)}
                              className={`flex items-center ${
                                userItem.is_verified ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              {userItem.is_verified ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {userItem.user_type === 'landlord' && (
                            <button
                              onClick={() => handleVerifyLandlord(userItem.id, userItem.is_verified)}
                              className="text-sm text-primary-600 hover:text-primary-800"
                            >
                              {userItem.is_verified ? 'Revoke' : 'Verify'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Property Management</h2>
            
            {properties.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No properties found</div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{property.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.is_active ? 'Active' : 'Hidden'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.is_vacant 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {property.is_vacant ? 'Vacant' : 'Occupied'}
                          </span>
                        </div>
                        
                        <div className="text-gray-600 text-sm mb-2">
                          {property.location} • {property.property_type} • {property.bedrooms} Bed • {property.bathrooms} Bath
                        </div>
                        
                        <div className="text-gray-500 text-sm">
                          Landlord ID: {property.landlord_id} • KES {property.monthly_rent.toLocaleString()}/month
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleTogglePropertyActive(property.id)}
                          className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                          title={property.is_active ? 'Hide Property' : 'Show Property'}
                        >
                          {property.is_active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-600"
                          title="Delete Property"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
