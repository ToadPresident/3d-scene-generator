# Backend API

FastAPI backend for 3D Scene Generation.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set API key
export GOOGLE_API_KEY="your-key"

# Start server
uvicorn main:app --reload --port 8000
```

## API Endpoints

### `POST /api/generate`

Generate a 3D scene from a text prompt.

**Request:**

```json
{
  "prompt": "Cyberpunk detective office"
}
```

**Response:**

```json
{
  "success": true,
  "ply_url": "/static/abc123/scene.ply",
  "image_url": "/static/abc123/concept.png",
  "generation_time_ms": 5432
}
```

### `GET /health`

Health check endpoint.

## Requirements

- Python 3.13
- Apple SHARP installed and accessible as `sharp` CLI
- Google API key with Gemini 2.5 Flash Image access

## File Structure

```
backend/
├── main.py              # FastAPI app
├── requirements.txt     # Dependencies
└── services/
    ├── gemini_service.py    # Image generation
    └── sharp_service.py     # 3D reconstruction
```
