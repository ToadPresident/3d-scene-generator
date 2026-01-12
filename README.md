# 🌌 3D Scene Generator

> Transform text prompts into immersive 3D environments in seconds

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)

A web-based demo that combines **Google Gemini 2.5 Flash Image** for AI image generation with **Apple SHARP** for instant 3D Gaussian Splatting reconstruction. Enter a text description, and walk through your generated 3D scene in first-person view.

![Demo Preview](docs/demo-preview.png)

---

## ✨ Features

- **Text-to-3D Pipeline**: Describe any scene and get an explorable 3D environment
- **Fast Generation**: ~5-10 seconds from prompt to walkable scene
- **First-Person Controls**: WASD movement with mouse look (FPS-style)
- **Cinematic Quality**: 16:9 wide-angle images optimized for depth
- **Modern Tech Stack**: Next.js 15, React 19, FastAPI, React Three Fiber

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Prompt   │────▶│  Gemini 2.5 Flash │────▶│  16:9 Concept   │
│                 │     │    Image API      │     │     Image       │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   3D Scene in   │◀────│   React Three    │◀────│   Apple SHARP   │
│    Browser      │     │     Fiber        │     │   (.ply file)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 📋 Prerequisites

Before running setup, make sure you have:

- **Conda** (Miniconda or Anaconda) - [Download](https://docs.conda.io/en/latest/miniconda.html)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Google AI Studio API Key** - [Get one here](https://aistudio.google.com/apikey)

### Hardware Support for SHARP

SHARP supports multiple backends:

- **CPU** - Works on any machine (slower)
- **CUDA GPU** - NVIDIA GPUs (fastest)
- **Apple MPS** - Apple Silicon Macs (M1/M2/M3/M4)

---

## 🚀 Quick Start (One Command Setup)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/3d-scene-generator.git
cd 3d-scene-generator

# 2. Run setup script (installs everything including SHARP)
chmod +x setup.sh
./setup.sh

# 3. Activate environment
conda activate 3d-scene-gen

# 4. Set your API key
export GOOGLE_API_KEY="your-api-key-here"

# 5. Start backend (Terminal 1)
cd backend && uvicorn main:app --reload --port 8000

# 6. Start frontend (Terminal 2)
cd frontend && npm run dev

# 7. Open http://localhost:3000
```

---

## 🚀 Quick Start

### Option 1: Local Development (Recommended)

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/3d-scene-generator.git
cd 3d-scene-generator
```

#### 2. Setup Backend

```bash
# Activate your SHARP conda environment
conda activate sharp

# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set your Google API key
export GOOGLE_API_KEY="your-api-key-here"

# Start the server
uvicorn main:app --reload --port 8000
```

#### 3. Setup Frontend (new terminal)

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

#### 4. Open the App

Navigate to **http://localhost:3000** in your browser.

---

### Option 2: One-Click Script

```bash
# Run setup first (one-time)
chmod +x setup.sh && ./setup.sh

# Then start both services
export GOOGLE_API_KEY="your-api-key"
./start.sh
```

---

### Option 3: Docker (Frontend Only)

> ⚠️ **Note**: Docker can run the frontend, but SHARP requires local installation due to GPU/MPS access.

```bash
# Start frontend with Docker
docker-compose up frontend

# Run backend locally (in another terminal)
conda activate sharp
cd backend && uvicorn main:app --port 8000
```

---

## 🎮 Usage

1. **Enter a Prompt**: Describe your scene in the left panel

   - Example: `Cyberpunk detective office with neon signs and rain`
   - Example: `Ancient temple ruins in a jungle, volumetric fog`
   - Example: `INT. SPACE STATION - CORRIDOR - NIGHT, cinematic lighting`

2. **Click "Generate Space"**: Wait 5-10 seconds for AI generation

3. **Explore the Scene**:
   - Click on the 3D view to enter first-person mode
   - **WASD** - Move around
   - **Mouse** - Look around
   - **ESC** - Exit first-person mode

---

## 📁 Project Structure

```
3d-scene-generator/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # API endpoints (/api/generate)
│   ├── requirements.txt        # Python dependencies
│   └── services/
│       ├── gemini_service.py   # Gemini API wrapper
│       └── sharp_service.py    # SHARP CLI wrapper
│
├── frontend/                   # Next.js React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # Global styles
│   │   └── components/
│   │       ├── PromptPanel.tsx         # Input UI
│   │       ├── SceneViewer.tsx         # R3F canvas wrapper
│   │       └── GaussianSplatViewer.tsx # 3D rendering
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
│
├── docs/                       # Documentation assets
├── .gitignore
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable         | Description              | Required |
| ---------------- | ------------------------ | -------- |
| `GOOGLE_API_KEY` | Google AI Studio API key | ✅ Yes   |

### Customization Options

Edit these constants in the source files:

**Backend** (`backend/services/gemini_service.py`):

- Prompt enhancement keywords
- Aspect ratio (default: 16:9)

**Frontend** (`frontend/src/components/GaussianSplatViewer.tsx`):

- Camera FOV (default: 85°)
- Movement speed (default: 2)
- Camera cage bounds (default: ±2m)

---

## 🛠️ Tech Stack

### Backend

- **FastAPI** - Modern async Python web framework
- **google-genai** - Official Google AI SDK
- **Uvicorn** - ASGI server

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with improved performance
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - R3F utilities (PointerLockControls)
- **Tailwind CSS** - Utility-first styling

### AI/3D

- **Gemini 2.5 Flash Image** - Text-to-image generation
- **Apple SHARP** - Single-image to 3D Gaussian Splatting
- **Custom WebGL Shader** - Gaussian splat rendering

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Apple ML Research](https://github.com/apple/ml-sharp) - SHARP model
- [Google AI](https://ai.google.dev/) - Gemini API
- [Pmndrs](https://github.com/pmndrs) - React Three Fiber

---

## 🐛 Troubleshooting

### "sharp: command not found"

Make sure you've activated the conda environment with SHARP installed:

```bash
conda activate sharp
```

### "Failed to load PLY"

Check that the backend is running on port 8000 and CORS is configured correctly.

### Canvas is blank

- Ensure WebGL is enabled in your browser
- Check browser console for errors
- Try refreshing the page

### Slow generation

- First generation may be slower due to model loading
- Subsequent generations should be faster (~5 seconds)
