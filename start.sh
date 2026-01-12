#!/bin/bash
# One-click start script for 3D Scene Generator
# Starts both backend and frontend in the background

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_NAME="3d-scene-gen"

echo "🚀 Starting 3D Scene Generator..."
echo ""

# Check for Google API key
if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${RED}❌ Error: GOOGLE_API_KEY not set${NC}"
    echo ""
    echo "Please set your API key first:"
    echo "  export GOOGLE_API_KEY=\"your-api-key-here\""
    echo ""
    echo "Get your API key from: https://aistudio.google.com/apikey"
    exit 1
fi
echo -e "${GREEN}✅ GOOGLE_API_KEY is set${NC}"

# Get conda path
CONDA_BASE=$(conda info --base 2>/dev/null)
if [ -z "$CONDA_BASE" ]; then
    echo -e "${RED}❌ Conda not found${NC}"
    exit 1
fi

ENV_PATH="$CONDA_BASE/envs/$ENV_NAME"
if [ ! -d "$ENV_PATH" ]; then
    echo -e "${RED}❌ Environment '$ENV_NAME' not found. Run setup.sh first.${NC}"
    exit 1
fi

# Kill any existing processes on our ports
echo "Cleaning up old processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Add conda environment to PATH so subprocess can find sharp
export PATH="$ENV_PATH/bin:$PATH"

# Verify sharp is available
if ! command -v sharp &> /dev/null; then
    echo -e "${RED}❌ SHARP not found. Run setup.sh first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SHARP CLI found${NC}"

# Start backend
echo ""
echo -e "${BLUE}Starting backend on http://localhost:8000...${NC}"
cd "$PROJECT_ROOT/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
sleep 2

# Check if backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Start frontend
echo ""
echo -e "${BLUE}Starting frontend on http://localhost:3000...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
sleep 3

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 All services running!${NC}"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Save PIDs for cleanup
echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"
echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"

# Wait and cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/.backend.pid" "$PROJECT_ROOT/.frontend.pid"
    echo "Done."
}

trap cleanup EXIT INT TERM

# Keep script running
wait
