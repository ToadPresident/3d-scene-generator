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

### What `setup.sh` installs

The setup script will automatically:

1. Create conda environment `3d-scene-gen` with Python 3.13
2. Clone and install [Apple SHARP](https://github.com/apple/ml-sharp) (with `pip install -e .`)
3. Install backend Python dependencies
4. Install frontend Node.js dependencies
5. **Download SHARP model weights (~2GB)** and verify installation

### Hardware Support for SHARP

SHARP supports multiple backends:

- **CPU** - Works on any machine (slower)
- **CUDA GPU** - NVIDIA GPUs (fastest)
- **Apple MPS** - Apple Silicon Macs (M1/M2/M3/M4)

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/3d-scene-generator.git
cd 3d-scene-generator

# 2. Setup (installs SHARP, Python deps, Node deps)
chmod +x setup.sh && ./setup.sh

# 3. Activate environment
conda activate 3d-scene-gen

# 4. Set API key
export GOOGLE_API_KEY="your-api-key"

# 5. Start (one command)
./start.sh
```

Then open **http://localhost:3000**

> ✅ Model weights are downloaded during `setup.sh`, so first generation will be fast (~5 seconds).

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
├── setup.sh                    # One-command setup script
├── start.sh                    # Start both services
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

Make sure you've activated the conda environment:

```bash
conda activate 3d-scene-gen
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
