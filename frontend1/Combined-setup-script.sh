#!/bin/bash

echo "=== Setting up Alumni Portal Full Stack Application ==="

# Create base project directory
mkdir -p alumni-portal
cd alumni-portal

# Download the backend and frontend setup scripts
echo "Downloading setup scripts..."
curl -o backend-setup.sh https://raw.githubusercontent.com/yourusername/alumni-portal/main/backend-setup.sh
curl -o frontend-setup.sh https://raw.githubusercontent.com/yourusername/alumni-portal/main/frontend-setup.sh

# Make scripts executable
chmod +x backend-setup.sh
chmod +x frontend-setup.sh

# Run the backend setup script
echo "=== Setting up backend... ==="
./backend-setup.sh

# Run the frontend setup script
echo "=== Setting up frontend... ==="
./frontend-setup.sh

# Create a run script for easy startup
echo "Creating startup script..."
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start the backend
echo "Starting backend server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload &
BACKEND_PID=$!

# Start the frontend
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap Ctrl-C
trap cleanup INT

# Wait for user to stop servers
echo "Servers are running. Press Ctrl+C to stop."
wait
EOF

chmod +x start-dev.sh

echo "=== Alumni Portal setup complete! ==="
echo "To initialize the database:"
echo "1. Create the database: createdb alumni_portal"
echo "2. Run migrations: cd backend && source venv/bin/activate && alembic upgrade head"
echo "3. Create admin user: cd backend && source venv/bin/activate && python create_admin.py"
echo ""
echo "To install dependencies:"
echo "1. Backend: cd backend && source venv/bin/activate && pip install -r requirements.txt"
echo "2. Frontend: cd frontend && npm install"
echo ""
echo "To start the development servers:"
echo "./start-dev.sh"
echo ""
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Default admin credentials:"
echo "- Email: admin@alumni.org"
echo "- Password: admin123"
