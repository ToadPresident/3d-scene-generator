#!/bin/bash
# Setup script for 3D Scene Generator
# Run this script after cloning the repository

set -e

echo "🌌 3D Scene Generator - Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This project requires macOS with Apple Silicon${NC}"
    exit 1
fi

# Check for Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
    echo -e "${YELLOW}⚠️  Warning: This project is optimized for Apple Silicon (M1/M2/M3/M4)${NC}"
fi

echo ""
echo "📦 Checking prerequisites..."

# Check for conda
if ! command -v conda &> /dev/null; then
    echo -e "${RED}❌ Conda not found. Please install Miniconda or Anaconda first.${NC}"
    echo "   Download: https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi
echo -e "${GREEN}✅ Conda found${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    echo "   Download: https://nodejs.org/ or use nvm"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js 20+ recommended (found v$NODE_VERSION)${NC}"
fi
echo -e "${GREEN}✅ Node.js found ($(node -v))${NC}"

# Check for SHARP
if ! command -v sharp &> /dev/null; then
    echo -e "${YELLOW}⚠️  SHARP CLI not found in current environment${NC}"
    echo "   Make sure you've installed Apple SHARP:"
    echo "   git clone https://github.com/apple/ml-sharp.git"
    echo "   cd ml-sharp && pip install -r requirements.txt"
else
    echo -e "${GREEN}✅ SHARP CLI found${NC}"
fi

# Check for Google API key
if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  GOOGLE_API_KEY not set${NC}"
    echo "   Get your API key from: https://aistudio.google.com/apikey"
    echo "   Then run: export GOOGLE_API_KEY=\"your-key-here\""
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start backend (Terminal 1):"
echo "   cd backend"
echo "   export GOOGLE_API_KEY=\"your-key\""
echo "   uvicorn main:app --reload --port 8000"
echo ""
echo "2. Start frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
