-- Drop tables if they exist (for re-runs)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  graduation_year INTEGER,
  major VARCHAR(100),
  profile_image_url VARCHAR(255),
  bio TEXT,
  job_title VARCHAR(100),
  company VARCHAR(100),
  location VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  capacity INTEGER,
  image_url VARCHAR(255),
  is_members_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, event_id)
);

-- Memberships Table
CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  membership_type VARCHAR(50) NOT NULL,
  payment_id VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an admin user (password: admin123)
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  is_admin
) VALUES (
  'admin@alumni.org',
  '$2b$10$rRtt0KjuN8fzPBDJZ6JKi.c5UmT2NFrVsT4YUDwS0mzLrVbBLOKEy',
  'Admin',
  'User',
  TRUE
);

-- Create some example events
INSERT INTO events (
  title, 
  description, 
  event_date, 
  location, 
  price, 
  capacity, 
  is_members_only
) VALUES 
(
  'Annual Alumni Gala',
  'Join us for our prestigious annual gala celebrating alumni achievements and connections.',
  CURRENT_DATE + INTERVAL '30 days',
  'Grand Ballroom, Alumni Center',
  75.00,
  200,
  TRUE
),
(
  'Career Networking Mixer',
  'Connect with fellow alumni and industry professionals to expand your professional network.',
  CURRENT_DATE + INTERVAL '14 days',
  'Conference Hall, Business Building',
  25.00,
  100,
  FALSE
),
(
  'Homecoming Weekend',
  'Return to campus for a weekend of nostalgia, sports, and reconnecting with classmates.',
  CURRENT_DATE + INTERVAL '60 days',
  'University Campus',
  50.00,
  500,
  FALSE
);
