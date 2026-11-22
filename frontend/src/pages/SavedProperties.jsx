import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import PropertyCard from '../components/PropertyCard'
import { Heart, Search } from 'lucide-react'

const SavedProperties = () => {
  const { user } = useAuth()
  const [savedProperties, setSavedProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedProperties()
  }, [])

  const fetchSavedProperties = async () => {
    try {
      const response = await api.get('/saved')
      setSavedProperties(response.data.properties)
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async (propertyId) => {
    try {
      await api.delete(`/saved/${propertyId}`)
      setSavedProperties(savedProperties.filter(p => p.id !== propertyId))
    } catch (error) {
      console.error('Error removing saved property:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
        <p className="text-gray-600">Properties you've bookmarked for later</p>
      </div>

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
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedProperties
