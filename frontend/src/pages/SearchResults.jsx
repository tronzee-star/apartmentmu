import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import api from '../utils/api'
import { Filter, X } from 'lucide-react'

const LOCATIONS = ['Mukuyu', 'Town', 'Pioneer', 'Catholic Area', 'Hill Top', 'Francfort', 'Prisons']
const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    is_vacant: searchParams.get('is_vacant') || ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await api.get(`/properties?${params.toString()}`)
      setProperties(response.data.properties)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    fetchProperties()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      is_vacant: ''
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filter Properties</h2>
            <button onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                className="input-field"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">All Locations</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                className="input-field"
                value={filters.property_type}
                onChange={(e) => setFilters({...filters, property_type: e.target.value})}
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (KES)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Min"
                value={filters.min_price}
                onChange={(e) => setFilters({...filters, min_price: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (KES)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Max"
                value={filters.max_price}
                onChange={(e) => setFilters({...filters, max_price: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                className="input-field"
                value={filters.bedrooms}
                onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vacancy Status</label>
              <select
                className="input-field"
                value={filters.is_vacant}
                onChange={(e) => setFilters({...filters, is_vacant: e.target.value})}
              >
                <option value="">All</option>
                <option value="true">Vacant Only</option>
                <option value="false">Occupied</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button onClick={applyFilters} className="btn-primary">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Clear All
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-4">No properties found matching your criteria</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">Found {properties.length} properties</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default SearchResults
