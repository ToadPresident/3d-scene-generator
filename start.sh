#!/bin/bash
# Quick start script - runs both backend and frontend

set -e

echo "🚀 Starting 3D Scene Generator..."

# Check for Google API key
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Error: GOOGLE_API_KEY not set"
    echo "   Run: export GOOGLE_API_KEY=\"your-key-here\""
    exit 1
fi

# Start backend in background
echo "Starting backend on port 8000..."
cd backend
uvicorn main:app --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
