# PropertyConnect Murang'a

A web-based property rental platform designed to connect landlords and prospective tenants within Murang'a County, Kenya.

## Features

### For Tenants
- **Property Search**: Search for rental properties by location, price, bedrooms, and property type
- **Property Details**: View detailed property information with multiple photographs
- **Save Properties**: Bookmark properties for later viewing
- **Viewing Requests**: Request physical property viewings with preferred dates and times
- **Messaging**: Communicate directly with landlords through the platform
- **Tenant Dashboard**: Track viewing requests, saved properties, and messages

### For Landlords
- **Property Management**: Add, edit, and delete property listings
- **Image Upload**: Upload multiple property photographs (via Cloudinary)
- **Vacancy Management**: Update property vacancy status
- **Viewing Requests**: Receive and manage tenant viewing requests
- **Messaging**: Communicate with prospective tenants
- **Landlord Dashboard**: Overview of properties, vacancies, and inquiries

### Platform Features
- **Location-Based**: Focused on 7 areas in Murang'a County (Mukuyu, Town, Pioneer, Catholic Area, Hill Top, Francfort, Prisons)
- **Property Types**: Apartments, Houses, Studios, Bed-sitters
- **Authentication**: Secure JWT-based authentication for tenants and landlords
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM
- **Flask-Migrate** - Database migrations
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - CORS support
- **PostgreSQL** - Database
- **Cloudinary** - Image storage

## Project Structure

```
apartmentmu/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── config.py              # Configuration settings
│   ├── extensions.py          # Flask extensions initialization
│   ├── models.py              # Database models
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── render.yaml           # Render deployment config
│   └── routes/
│       ├── auth.py           # Authentication endpoints
│       ├── properties.py     # Property CRUD endpoints
│       ├── viewing_requests.py  # Viewing request endpoints
│       ├── messages.py       # Messaging endpoints
│       └── saved_properties.py  # Saved properties endpoints
└── frontend/
    ├── index.html            # HTML entry point
    ├── package.json          # Node dependencies
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind configuration
    ├── vercel.json          # Vercel deployment config
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Main app component
        ├── index.css         # Global styles
        ├── context/
        │   └── AuthContext.jsx  # Authentication context
        ├── components/
        │   ├── Navbar.jsx
        │   ├── PropertyCard.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── SearchResults.jsx
        │   ├── PropertyDetails.jsx
        │   ├── TenantDashboard.jsx
        │   ├── LandlordDashboard.jsx
        │   ├── Messages.jsx
        │   └── SavedProperties.jsx
        └── utils/
            └── api.js        # Axios instance
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=postgresql://username:password@localhost/propertyconnect
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (landlord only)
- `PUT /api/properties/:id` - Update property (landlord only)
- `DELETE /api/properties/:id` - Delete property (landlord only)
- `GET /api/properties/landlord` - Get landlord's properties
- `POST /api/properties/upload-image` - Upload image to Cloudinary

### Viewing Requests
- `POST /api/viewing-requests` - Create viewing request (tenant only)
- `PUT /api/viewing-requests/:id` - Update viewing request status (landlord only)
- `GET /api/viewing-requests/tenant` - Get tenant's viewing requests
- `GET /api/viewing-requests/landlord` - Get landlord's viewing requests
- `DELETE /api/viewing-requests/:id` - Delete viewing request (tenant only)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:userId` - Get messages with specific user
- `PUT /api/messages/:id/read` - Mark message as read
- `GET /api/messages/unread-count` - Get unread message count

### Saved Properties
- `POST /api/saved` - Save property (tenant only)
- `DELETE /api/saved/:propertyId` - Remove saved property (tenant only)
- `GET /api/saved` - Get saved properties (tenant only)
- `GET /api/saved/:propertyId/check` - Check if property is saved

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `frontend`
4. Deploy

### Backend (Render)

1. Push your code to GitHub
2. Create a new web service in Render
3. Connect your GitHub repository
4. Set the root directory to `backend`
5. Add environment variables
6. Deploy

## Environment Variables

### Backend (.env)
- `FLASK_APP` - Flask app entry point
- `FLASK_ENV` - Environment (development/production)
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT secret key
- `DATABASE_URL` - PostgreSQL connection string
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Future Enhancements

- M-Pesa integration for rent payments
- Digital rental agreements
- Interactive maps for property locations
- Automated notifications (email/SMS)
- Subscription plans for landlords
- AI-powered property recommendations
- Real-time chat with WebSockets
- Property verification badges
- Advanced analytics dashboard

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or open an issue on GitHub.
