import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { MapPin, Bed, Bath, Home, Calendar, Heart, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

const PropertyDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showViewingForm, setShowViewingForm] = useState(false)
  const [viewingData, setViewingData] = useState({
    preferred_date: '',
    preferred_time: '',
    message: ''
  })

  useEffect(() => {
    fetchProperty()
    if (user?.user_type === 'tenant') {
      checkIfSaved()
    }
  }, [id, user])

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`)
      setProperty(response.data.property)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfSaved = async () => {
    try {
      const response = await api.get(`/saved/${id}/check`)
      setIsSaved(response.data.is_saved)
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const handleToggleSave = async () => {
    if (!user || user.user_type !== 'tenant') {
      navigate('/login')
      return
    }

    try {
      if (isSaved) {
        await api.delete(`/saved/${id}`)
      } else {
        await api.post('/saved', { property_id: parseInt(id) })
      }
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const handleViewingRequest = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await api.post('/viewing-requests', {
        property_id: parseInt(id),
        preferred_date: viewingData.preferred_date,
        preferred_time: viewingData.preferred_time,
        message: viewingData.message
      })
      setShowViewingForm(false)
      alert('Viewing request submitted successfully!')
      setViewingData({ preferred_date: '', preferred_time: '', message: '' })
    } catch (error) {
      console.error('Error submitting viewing request:', error)
      alert('Error submitting viewing request')
    }
  }

  const handleMessageLandlord = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/messages')
  }

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((currentImageIndex + 1) % property.images.length)
    }
  }

  const prevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!property) {
    return <div className="flex justify-center items-center h-screen">Property not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-6" style={{ height: '400px' }}>
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Home className="h-24 w-24" />
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.location}, Murang'a</span>
                </div>
              </div>
              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-full ${
                  isSaved ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                } hover:scale-110 transition-transform`}
              >
                <Heart className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center">
                <Bed className="h-5 w-5 mr-2 text-gray-600" />
                <span className="font-medium">{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-5 w-5 mr-2 text-gray-600" />
                <span className="font-medium">{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-gray-600" />
                <span className="font-medium">{property.property_type}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-primary-600">
                  KES {property.monthly_rent.toLocaleString()}
                </span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <div className="text-gray-600 mt-1">
                Deposit: KES {property.deposit.toLocaleString()}
              </div>
            </div>

            <div className={`mb-4 ${property.is_vacant ? 'text-green-600' : 'text-red-600'}`}>
              {property.is_vacant ? '✓ Currently Vacant' : '✗ Currently Occupied'}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Contact Landlord</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowViewingForm(true)}
                disabled={!property.is_vacant}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Request Viewing
              </button>
              
              <button
                onClick={handleMessageLandlord}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Message Landlord
              </button>
            </div>

            {!property.is_vacant && (
              <p className="text-sm text-gray-500 mt-4">
                This property is currently occupied. You can still message the landlord for future availability.
              </p>
            )}

            <div className="border-t mt-6 pt-6">
              <h3 className="font-semibold mb-2">Property Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{property.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{property.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bathrooms:</span>
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Viewing Request Modal */}
      {showViewingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Request Viewing</h2>
              <button onClick={() => setShowViewingForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleViewingRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={viewingData.preferred_date}
                  onChange={(e) => setViewingData({...viewingData, preferred_date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <input
                  type="time"
                  className="input-field"
                  required
                  value={viewingData.preferred_time}
                  onChange={(e) => setViewingData({...viewingData, preferred_time: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={viewingData.message}
                  onChange={(e) => setViewingData({...viewingData, message: e.target.value})}
                  placeholder="Any specific questions or requests..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewingForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetails
