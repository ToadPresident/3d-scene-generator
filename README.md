# 🌌 3D Scene Generator

> Transform text prompts into immersive 3D environments in seconds

[![Demo](https://img.shields.io/badge/🚀_Try_Live_Demo-blue?style=for-the-badge)](https://your-vercel-app.vercel.app)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)

A web-based demo combining **Google Gemini 2.5 Flash Image** for AI image generation with **Apple SHARP** for instant 3D Gaussian Splatting reconstruction. Enter a text description, and walk through your generated 3D scene in first-person view.

**🔐 BYOK (Bring Your Own Key)** - Use your own Gemini API key. No server-side keys stored.

---

## ✨ Features

- **Text-to-3D Pipeline**: Describe any scene → get an explorable 3D environment
- **Fast Generation**: ~5-10 seconds from prompt to walkable scene
- **First-Person Controls**: WASD + mouse movement (FPS-style)
- **BYOK Security**: Your API key stays in your browser only
- **Modern Tech Stack**: Next.js 15, React 19, FastAPI, React Three Fiber

---

## 🚀 Try It Now

### Option 1: Cloud Demo (Recommended)

1. Visit the [Live Demo](https://your-vercel-app.vercel.app)
2. Click **"Set Gemini API Key"** and enter your key ([Get one free](https://aistudio.google.com/apikey))
3. Describe a scene and click **Generate Space**

### Option 2: Local Setup

```bash
# Clone
git clone https://github.com/ToadPresident/3d-scene-generator.git
cd 3d-scene-generator

# Setup (installs SHARP, dependencies)
chmod +x setup.sh && ./setup.sh

# Activate & Start
conda activate 3d-scene-gen
./start.sh
```

Open **http://localhost:3000** and enter your Gemini API key in the UI.

---

## 🎮 Controls

| Key       | Action                       |
| --------- | ---------------------------- |
| **WASD**  | Move forward/left/back/right |
| **Q/E**   | Move down/up                 |
| **Mouse** | Look around                  |
| **Click** | Enter first-person mode      |
| **ESC**   | Exit first-person mode       |

---

## 🏗️ Architecture

```
User Prompt → Gemini 2.5 Flash → 16:9 Image → Apple SHARP → 3D Gaussians → Browser
```

| Component    | Tech                                        |
| ------------ | ------------------------------------------- |
| Frontend     | Next.js 15, React Three Fiber, Tailwind CSS |
| Backend      | FastAPI, Apple SHARP, google-genai          |
| 3D Rendering | @react-three/drei Splat                     |

---

## 🌐 Deploy Your Own

### Frontend → Vercel

1. Fork this repo
2. Import to [Vercel](https://vercel.com/new)
3. Set **Root Directory** to `frontend`
4. Add env var: `NEXT_PUBLIC_API_URL` = your backend URL

### Backend → Hugging Face Spaces

1. Create new [Space](https://huggingface.co/new-space) with **Docker** SDK
2. Clone the Space and copy `backend/` contents
3. Rename `README_HF.md` to `README.md`
4. Push and wait for build

---

## 📁 Project Structure

```
3d-scene-generator/
├── backend/                 # FastAPI backend
│   ├── main.py              # API endpoints
│   ├── Dockerfile           # HuggingFace deployment
│   └── services/
│       ├── gemini_service.py
│       └── sharp_service.py
├── frontend/                # Next.js frontend
│   ├── src/app/page.tsx
│   ├── src/components/
│   ├── .env.example
│   └── vercel.json
├── setup.sh                 # Local setup
└── start.sh                 # Local start
```

---

## 🔧 Environment Variables

### Frontend

| Variable              | Description | Default                 |
| --------------------- | ----------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend URL | `http://localhost:8000` |

### Backend

API key is provided by users via `X-API-Key` header (BYOK pattern).

---

## 🤝 Contributing

1. Fork → 2. Branch → 3. Commit → 4. PR

---

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- [Apple ML Research](https://github.com/apple/ml-sharp) - SHARP model
- [Google AI](https://ai.google.dev/) - Gemini API
- [Pmndrs](https://github.com/pmndrs) - React Three Fiber
