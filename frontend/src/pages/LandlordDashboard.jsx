import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Plus, Home, Calendar, MessageSquare, Users, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

const LandlordDashboard = () => {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [viewingRequests, setViewingRequests] = useState([])
  const [activeTab, setActiveTab] = useState('properties')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)

  const LOCATIONS = ['Mukuyu', 'Town', 'Pioneer', 'Catholic Area', 'Hill Top', 'Francfort', 'Prisons']
  const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [propsRes, viewingsRes] = await Promise.all([
        api.get('/properties/landlord'),
        api.get('/viewing-requests/landlord')
      ])
      setProperties(propsRes.data.properties)
      setViewingRequests(viewingsRes.data.viewing_requests)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVacancy = async (propertyId, currentStatus) => {
    try {
      await api.put(`/properties/${propertyId}`, { is_vacant: !currentStatus })
      fetchData()
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const handleToggleActive = async (propertyId, currentStatus) => {
    try {
      await api.put(`/properties/${propertyId}`, { is_active: !currentStatus })
      fetchData()
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    
    try {
      await api.delete(`/properties/${propertyId}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const handleViewingResponse = async (requestId, status) => {
    try {
      await api.put(`/viewing-requests/${requestId}`, { status })
      fetchData()
    } catch (error) {
      console.error('Error updating viewing request:', error)
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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.full_name}</h1>
        <p className="text-gray-600">Manage your properties and tenant inquiries</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-full p-3 mr-4">
              <Home className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{properties.length}</div>
              <div className="text-gray-600">Total Properties</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {properties.filter(p => p.is_vacant).length}
              </div>
              <div className="text-gray-600">Vacant</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <EyeOff className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {properties.filter(p => !p.is_vacant).length}
              </div>
              <div className="text-gray-600">Occupied</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{viewingRequests.length}</div>
              <div className="text-gray-600">Viewing Requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'properties'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="h-5 w-5 inline mr-2" />
              My Properties
            </button>
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
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'properties' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Properties</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Property
                </button>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-4">No properties listed yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary inline-flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{property.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.is_vacant 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {property.is_vacant ? 'Vacant' : 'Occupied'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.is_active 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {property.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          
                          <div className="text-gray-600 text-sm mb-2">
                            {property.location} • {property.property_type} • {property.bedrooms} Bed • {property.bathrooms} Bath
                          </div>
                          
                          <div className="text-xl font-bold text-primary-600 mb-2">
                            KES {property.monthly_rent.toLocaleString()}/month
                          </div>
                          
                          <div className="text-gray-500 text-sm">
                            Deposit: KES {property.deposit.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleToggleVacancy(property.id, property.is_vacant)}
                            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                            title={property.is_vacant ? 'Mark as Occupied' : 'Mark as Vacant'}
                          >
                            {property.is_vacant ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => handleToggleActive(property.id, property.is_active)}
                            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                            title={property.is_active ? 'Hide Property' : 'Show Property'}
                          >
                            {property.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => setEditingProperty(property)}
                            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'viewings' && (
            <>
              {viewingRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No viewing requests yet</p>
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
                            Requested by Tenant #{request.tenant_id}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
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
                        <div className="text-sm mb-3">
                          <span className="text-gray-600">Message:</span>
                          <p className="mt-1 text-gray-800">{request.message}</p>
                        </div>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewingResponse(request.id, 'accepted')}
                            className="btn-primary text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleViewingResponse(request.id, 'declined')}
                            className="btn-danger text-sm"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleViewingResponse(request.id, 'rescheduled')}
                            className="btn-secondary text-sm"
                          >
                            Propose New Time
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Property Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Property</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <PropertyForm onSubmit={() => { setShowAddForm(false); fetchData(); }} />
          </div>
        </div>
      )}

      {editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Property</h2>
              <button onClick={() => setEditingProperty(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <PropertyForm 
              property={editingProperty} 
              onSubmit={() => { setEditingProperty(null); fetchData(); }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

const PropertyForm = ({ property, onSubmit }) => {
  const [formData, setFormData] = useState(property || {
    title: '',
    description: '',
    property_type: 'Apartment',
    location: 'Mukuyu',
    address: '',
    monthly_rent: '',
    deposit: '',
    bedrooms: 1,
    bathrooms: 1,
    is_vacant: true,
    amenities: []
  })

  const LOCATIONS = ['Mukuyu', 'Town', 'Pioneer', 'Catholic Area', 'Hill Top', 'Francfort', 'Prisons']
  const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (property) {
        await api.put(`/properties/${property.id}`, formData)
      } else {
        await api.post('/properties', formData)
      }
      onSubmit()
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          className="input-field"
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          className="input-field"
          rows={4}
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select
            className="input-field"
            value={formData.property_type}
            onChange={(e) => setFormData({...formData, property_type: e.target.value})}
          >
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            className="input-field"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          className="input-field"
          required
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (KES)</label>
          <input
            type="number"
            className="input-field"
            required
            value={formData.monthly_rent}
            onChange={(e) => setFormData({...formData, monthly_rent: parseInt(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (KES)</label>
          <input
            type="number"
            className="input-field"
            required
            value={formData.deposit}
            onChange={(e) => setFormData({...formData, deposit: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
          <input
            type="number"
            className="input-field"
            required
            min={1}
            value={formData.bedrooms}
            onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
          <input
            type="number"
            className="input-field"
            required
            min={1}
            value={formData.bathrooms}
            onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_vacant"
          checked={formData.is_vacant}
          onChange={(e) => setFormData({...formData, is_vacant: e.target.checked})}
          className="mr-2"
        />
        <label htmlFor="is_vacant" className="text-sm font-medium text-gray-700">
          Property is vacant
        </label>
      </div>

      <div className="flex space-x-4">
        <button type="submit" className="btn-primary">
          {property ? 'Update Property' : 'Add Property'}
        </button>
        <button type="button" onClick={onSubmit} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default LandlordDashboard
