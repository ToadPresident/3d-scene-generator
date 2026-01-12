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

# Create fresh environment with Python 3.13 (recommended by SHARP)
conda create -n $ENV_NAME python=3.13 -y
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

# Install SHARP dependencies and the package itself
echo "Installing SHARP..."
cd "$SHARP_DIR"

# Step 1: Install dependencies
"$ENV_PATH/bin/pip" install -r requirements.txt

# Step 2: Install SHARP package itself (this makes 'sharp' CLI available)
"$ENV_PATH/bin/pip" install -e .

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
echo -e "${BLUE}📦 Step 6: Testing SHARP and downloading model weights (~2GB)...${NC}"
echo -e "${YELLOW}   This may take 5-10 minutes on first run. Please wait...${NC}"

# Create a simple test image (solid color PNG)
TEST_DIR="$PROJECT_ROOT/.setup_test"
mkdir -p "$TEST_DIR/input" "$TEST_DIR/output"

# Generate a simple 512x512 test image using Python
"$ENV_PATH/bin/python" << 'PYTHON_SCRIPT'
from PIL import Image
import os
test_dir = os.environ.get('TEST_DIR', '/tmp/setup_test')
img = Image.new('RGB', (512, 512), color=(100, 150, 200))
img.save(f"{test_dir}/input/test.png")
print("Test image created")
PYTHON_SCRIPT

export TEST_DIR="$TEST_DIR"

# Run SHARP on test image (this triggers model download)
echo "Running SHARP test (downloading model if needed)..."
if "$ENV_PATH/bin/sharp" predict -i "$TEST_DIR/input" -o "$TEST_DIR/output" 2>&1; then
    echo -e "${GREEN}✅ SHARP test passed - model downloaded and working${NC}"
else
    echo -e "${RED}❌ SHARP test failed${NC}"
    echo "   Check the error above. You may need to:"
    echo "   1. Check your internet connection"
    echo "   2. Manually download the model:"
    echo "      curl -L -o ~/.cache/torch/hub/checkpoints/sharp_2572gikvuh.pt \\"
    echo "        https://ml-site.cdn-apple.com/models/sharp/sharp_2572gikvuh.pt"
    rm -rf "$TEST_DIR"
    exit 1
fi

# Cleanup test files
rm -rf "$TEST_DIR"

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
echo -e "${YELLOW}3. Start the app:${NC}"
echo "   ./start.sh"
echo ""
echo -e "${YELLOW}4. Open in browser:${NC}"
echo "   http://localhost:3000"
echo ""
