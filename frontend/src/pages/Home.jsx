import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Home as HomeIcon, Shield, Users, ArrowRight } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import api from '../utils/api'

const LOCATIONS = ['Mukuyu', 'Town', 'Pioneer', 'Catholic Area', 'Hill Top', 'Francfort', 'Prisons']
const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: ''
  })
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const response = await api.get('/properties?is_vacant=true')
      setFeaturedProperties(response.data.properties.slice(0, 6))
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    window.location.href = `/search?${params.toString()}`
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Rental in Murang'a
            </h1>
            <p className="text-xl text-primary-100">
              Browse vacant apartments and houses without leaving your home
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 max-w-4xl mx-auto border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-gray-800 text-sm font-semibold mb-2">Location</label>
                <select
                  className="input-field"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-semibold mb-2">Property Type</label>
                <select
                  className="input-field"
                  value={searchParams.property_type}
                  onChange={(e) => setSearchParams({...searchParams, property_type: e.target.value})}
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-semibold mb-2">Min Price (KES)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Min"
                  value={searchParams.min_price}
                  onChange={(e) => setSearchParams({...searchParams, min_price: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-semibold mb-2">Max Price (KES)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Max"
                  value={searchParams.max_price}
                  onChange={(e) => setSearchParams({...searchParams, max_price: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-semibold mb-2">Bedrooms</label>
                <select
                  className="input-field"
                  value={searchParams.bedrooms}
                  onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full mt-4 btn-primary flex items-center justify-center">
              <Search className="h-5 w-5 mr-2" />
              Search Properties
            </button>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Properties</h3>
              <p className="text-gray-600">
                Browse available rentals by location, price, and amenities from the comfort of your home
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <HomeIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View & Connect</h3>
              <p className="text-gray-600">
                View actual empty apartment photos and request viewings or message landlords directly
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rent with Confidence</h3>
              <p className="text-gray-600">
                Verified landlords and transparent listings help you find the perfect home
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Vacant Properties</h2>
            <Link to="/search" className="btn-primary flex items-center">
              View All
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No properties available at the moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Neighbourhoods</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LOCATIONS.map(location => (
              <Link
                key={location}
                to={`/search?location=${location}`}
                className="bg-gray-100 rounded-lg p-6 text-center hover:bg-primary-100 transition-colors"
              >
                <MapPin className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                <span className="font-medium">{location}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Are You a Landlord?</h2>
              <p className="text-gray-600 mb-6">
                List your vacant properties and reach thousands of potential tenants in Murang'a. 
                Manage inquiries, schedule viewings, and communicate with tenants all in one place.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary-600" />
                  <span>Reach more tenants</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary-600" />
                  <span>Verified listings build trust</span>
                </li>
                <li className="flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2 text-primary-600" />
                  <span>Easy property management</span>
                </li>
              </ul>
              <Link to="/register" className="btn-primary inline-flex items-center">
                Register as Landlord
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Locations</span>
                  <span className="font-bold text-2xl text-primary-600">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Property Types</span>
                  <span className="font-bold text-2xl text-primary-600">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">24/7 Availability</span>
                  <span className="font-bold text-2xl text-primary-600">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PropertyConnect Murang'a</h3>
              <p className="text-gray-400">
                Connecting landlords and tenants in Murang'a County
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/search" className="hover:text-white">Search Properties</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Locations</h3>
              <ul className="space-y-2 text-gray-400">
                {LOCATIONS.map(loc => (
                  <li key={loc}>{loc}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PropertyConnect Murang'a. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
