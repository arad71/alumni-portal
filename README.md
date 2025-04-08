# Alumni Portal

A full-stack web application for managing an alumni community. This project provides a platform for alumni to connect, attend events, access an alumni directory, and manage memberships.

## Features

- **User Authentication**: Register, login, and profile management
- **Alumni Directory**: Searchable directory of alumni (requires membership)
- **Event Management**: Browse, register, and pay for events
- **Membership System**: Subscribe to different membership plans
- **Payment Processing**: Secure payment integration with Stripe
- **Admin Dashboard**: Manage users, events, and view statistics

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for Python
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database interactions
- **Alembic**: Database migrations
- **JWT**: Token-based authentication
- **Stripe**: Payment processing

### Frontend
- **React**: Frontend library
- **TypeScript**: Type-safe JavaScript
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Formik & Yup**: Form handling and validation
- **Framer Motion**: Animations
- **Axios**: HTTP client

## Project Structure

```
alumni-portal/
├── backend/               # FastAPI backend
│   ├── app/               # Application code
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── main.py        # Main FastAPI application
│   ├── alembic/           # Database migrations
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
└── frontend/              # React frontend
    ├── public/            # Static files
    ├── src/               # Source code
    │   ├── components/    # React components
    │   ├── contexts/      # Context providers
    │   ├── hooks/         # Custom hooks
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── utils/         # Utility functions
    ├── package.json       # NPM dependencies
    └── .env               # Environment variables
```

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL

### Quick Start
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/alumni-portal.git
   cd alumni-portal
   ```

2. Run the setup script:
   ```
   chmod +x setup.sh
   ./setup.sh
   ```

3. Initialize the database:
   ```
   createdb alumni_portal
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   alembic upgrade head
   python create_admin.py
   ```

4. Start the development servers:
   ```
   ./start-dev.sh
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend
1. Create and activate a virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a PostgreSQL database:
   ```
   createdb alumni_portal
   ```

4. Apply migrations:
   ```
   alembic upgrade head
   ```

5. Create an admin user:
   ```
   python create_admin.py
   ```

6. Start the backend server:
   ```
   uvicorn app.main:app --reload
   ```

#### Frontend
1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost/alumni_portal
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user information

### Users
- `GET /api/users/search` - Search alumni directory (requires membership)
- `GET /api/users/{id}` - Get user profile by ID
- `PUT /api/users/profile` - Update user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get event details by ID
- `POST /api/events` - Create a new event (admin only)
- `PUT /api/events/{id}` - Update an event (admin only)
- `DELETE /api/events/{id}` - Delete an event (admin only)

### Registrations
- `POST /api/registrations` - Register for an event
- `GET /api/registrations/my-events` - Get user's registered events
- `DELETE /api/registrations/{eventId}` - Cancel registration

### Memberships
- `POST /api/memberships` - Create a new membership
- `GET /api/memberships/my-membership` - Get user's membership status
- `PUT /api/memberships/{id}/cancel` - Cancel membership

### Payments
- `POST /api/payments/create-intent` - Create a payment intent
- `POST /api/payments/webhook` - Handle Stripe webhook events
- `GET /api/payments/config` - Get Stripe public key

## Default Admin User
- Email: admin@alumni.org
- Password: admin123

## Deployment

### Backend
1. Set up a production database
2. Configure environment variables for production
3. Deploy to a service like Heroku, AWS, or DigitalOcean
4. Set up a proper WSGI server like Gunicorn

### Frontend
1. Build the production version:
   ```
   cd frontend
   npm run build
   ```
2. Deploy the build folder to services like Netlify, Vercel, or AWS S3

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
