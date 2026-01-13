---
title: 3D Scene Generator
emoji: 🎨
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# 3D Scene Generator Backend

This Space hosts the FastAPI backend for the 3D Scene Generator project.

## Features

- Text to 3D scene generation using Gemini + SHARP
- BYOK (Bring Your Own Key) - Users provide their own Gemini API key
- Returns 3D Gaussian Splatting (.splat) files

## API Endpoints

- `GET /health` - Health check
- `POST /api/generate` - Generate 3D scene from text prompt
  - Header: `X-API-Key` - Your Gemini API key
  - Body: `{"prompt": "your scene description"}`
