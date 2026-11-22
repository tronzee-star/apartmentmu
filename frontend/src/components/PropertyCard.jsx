import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Heart } from 'lucide-react'

const PropertyCard = ({ property, isSaved = false, onToggleSave }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={property.images?.[0] || '/placeholder-house.jpg'} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleSave && onToggleSave(property.id)
            }}
            className={`p-2 rounded-full ${
              isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
            } hover:scale-110 transition-transform`}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.is_vacant 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {property.is_vacant ? 'Vacant' : 'Occupied'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}, Murang'a</span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center space-x-4 text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.bathrooms} Bath</span>
          </div>
          <div className="text-sm text-gray-500">{property.property_type}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              KES {property.monthly_rent.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <Link 
            to={`/property/${property.id}`}
            className="btn-primary text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard
