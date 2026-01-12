#!/bin/bash
# Setup script for 3D Scene Generator
# This script creates a complete environment with all dependencies

set -e

echo "🌌 3D Scene Generator - Full Setup"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_NAME="3d-scene-gen"

echo ""
echo -e "${BLUE}📦 Step 1: Checking prerequisites...${NC}"

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
    echo "   Download: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found ($(node -v))${NC}"

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git found${NC}"

echo ""
echo -e "${BLUE}📦 Step 2: Creating conda environment '${ENV_NAME}'...${NC}"

# Remove existing environment if it exists
conda env remove -n $ENV_NAME -y 2>/dev/null || true

# Create fresh environment
conda create -n $ENV_NAME python=3.11 -y
echo -e "${GREEN}✅ Conda environment created${NC}"

# Get conda base path
CONDA_BASE=$(conda info --base)
ENV_PATH="$CONDA_BASE/envs/$ENV_NAME"

echo ""
echo -e "${BLUE}📦 Step 3: Installing Apple SHARP...${NC}"

# Clone SHARP if not exists
SHARP_DIR="$PROJECT_ROOT/ml-sharp"
if [ ! -d "$SHARP_DIR" ]; then
    echo "Cloning Apple SHARP repository..."
    git clone https://github.com/apple/ml-sharp.git "$SHARP_DIR"
else
    echo "SHARP directory already exists, updating..."
    cd "$SHARP_DIR" && git pull
fi

# Install SHARP dependencies (must run from within ml-sharp directory)
echo "Installing SHARP dependencies..."
cd "$SHARP_DIR"
"$ENV_PATH/bin/pip" install -r requirements.txt
cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ SHARP installed${NC}"

echo ""
echo -e "${BLUE}📦 Step 4: Installing backend dependencies...${NC}"
"$ENV_PATH/bin/pip" install -r "$PROJECT_ROOT/backend/requirements.txt"
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo ""
echo -e "${BLUE}📦 Step 5: Installing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

echo ""
echo -e "${BLUE}📦 Step 6: Verifying SHARP installation...${NC}"
if "$ENV_PATH/bin/sharp" --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SHARP CLI is working${NC}"
else
    echo -e "${RED}❌ SHARP CLI verification failed${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo -e "${YELLOW}1. Activate the environment:${NC}"
echo "   conda activate $ENV_NAME"
echo ""
echo -e "${YELLOW}2. Set your Google API key:${NC}"
echo "   export GOOGLE_API_KEY=\"your-api-key-here\""
echo ""
echo -e "${YELLOW}3. Start backend (Terminal 1):${NC}"
echo "   cd $PROJECT_ROOT/backend"
echo "   uvicorn main:app --reload --port 8000"
echo ""
echo -e "${YELLOW}4. Start frontend (Terminal 2):${NC}"
echo "   cd $PROJECT_ROOT/frontend"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}5. Open in browser:${NC}"
echo "   http://localhost:3000"
echo ""
