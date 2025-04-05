# Alumni Portal

A complete web application for alumni management with membership, events, and directory features.

## Features

- User authentication (login, register, password reset)
- Alumni directory with search
- Event management and registration
- Payment processing with Stripe
- Membership management

## Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
   ```
   createdb alumni_portal
   ```

2. Run the setup script:
   ```
   psql -U postgres -d alumni_portal -f server/db-setup.sql
   ```

### Server Setup

1. Navigate to server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env`

4. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env`

4. Start the client:
   ```
   npm start
   ```

## Default Admin User

Email: admin@alumni.org
Password: admin123

## Tech Stack

- Frontend: React, React Router, Formik, Stripe Elements
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT
- Payment: Stripe
