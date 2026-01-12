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
echo -e "${BLUE}📦 Step 6: Downloading SHARP model weights (~2.6GB)...${NC}"
echo -e "${YELLOW}   This may take 5-10 minutes. Please wait...${NC}"

MODEL_DIR="$HOME/.cache/torch/hub/checkpoints"
MODEL_FILE="$MODEL_DIR/sharp_2572gikvuh.pt"
MODEL_URL="https://ml-site.cdn-apple.com/models/sharp/sharp_2572gikvuh.pt"
EXPECTED_MIN_SIZE=2600000000  # Minimum expected size (~2.6GB)

mkdir -p "$MODEL_DIR"

# Download model with curl (more reliable than torch.hub for large files)
if [ -f "$MODEL_FILE" ]; then
    ACTUAL_SIZE=$(stat -f%z "$MODEL_FILE" 2>/dev/null || stat -c%s "$MODEL_FILE" 2>/dev/null)
    if [ "$ACTUAL_SIZE" -gt "$EXPECTED_MIN_SIZE" ]; then
        echo -e "${GREEN}✅ Model already downloaded and verified${NC}"
    else
        echo -e "${YELLOW}⚠️  Existing model file is incomplete, re-downloading...${NC}"
        rm -f "$MODEL_FILE"
    fi
fi

if [ ! -f "$MODEL_FILE" ]; then
    echo "Downloading from Apple CDN..."
    if curl -L --progress-bar -o "$MODEL_FILE" "$MODEL_URL"; then
        ACTUAL_SIZE=$(stat -f%z "$MODEL_FILE" 2>/dev/null || stat -c%s "$MODEL_FILE" 2>/dev/null)
        if [ "$ACTUAL_SIZE" -gt "$EXPECTED_MIN_SIZE" ]; then
            echo -e "${GREEN}✅ Model downloaded successfully ($(numfmt --to=iec $ACTUAL_SIZE 2>/dev/null || echo "$ACTUAL_SIZE bytes"))${NC}"
        else
            echo -e "${RED}❌ Download incomplete. File size: $ACTUAL_SIZE bytes${NC}"
            rm -f "$MODEL_FILE"
            exit 1
        fi
    else
        echo -e "${RED}❌ Download failed. Check your internet connection.${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📦 Step 7: Testing SHARP installation...${NC}"

# Create a simple test image
TEST_DIR="$PROJECT_ROOT/.setup_test"
mkdir -p "$TEST_DIR/input" "$TEST_DIR/output"

"$ENV_PATH/bin/python" -c "
from PIL import Image
img = Image.new('RGB', (512, 512), color=(100, 150, 200))
img.save('$TEST_DIR/input/test.png')
print('Test image created')
"

# Run SHARP test
echo "Running SHARP prediction test..."
if "$ENV_PATH/bin/sharp" predict -i "$TEST_DIR/input" -o "$TEST_DIR/output" 2>&1; then
    # Check if PLY file was generated
    if ls "$TEST_DIR/output"/*.ply 1>/dev/null 2>&1; then
        echo -e "${GREEN}✅ SHARP test passed - PLY file generated${NC}"
    else
        echo -e "${RED}❌ SHARP ran but no PLY file generated${NC}"
        rm -rf "$TEST_DIR"
        exit 1
    fi
else
    echo -e "${RED}❌ SHARP test failed${NC}"
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
