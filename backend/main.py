"""
3D Scene Generation Demo - FastAPI Backend
Combines Google Gemini 2.5 Flash Image with Apple SHARP for text-to-3D generation.
"""

import os
import uuid
import shutil
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.gemini_service import generate_concept_image
from services.sharp_service import generate_3d_scene, convert_ply_to_splat


# Configuration
STATIC_DIR = Path(__file__).parent / "static"
TEMP_DIR = Path(__file__).parent / "temp"

# Create directories immediately (needed for StaticFiles mount)
STATIC_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - setup and teardown."""
    print("✅ Backend ready - directories initialized")
    
    yield  # Application runs
    
    # Shutdown: Cleanup temp files (keep static for caching)
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
    print("🧹 Cleanup complete")


app = FastAPI(
    title="3D Scene Generator",
    description="Generate immersive 3D scenes from text prompts",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Allow frontend access (local and cloud deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3002", 
        "http://127.0.0.1:3002",
        "https://*.vercel.app",  # Vercel deployments
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Dynamic Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (generated PLY/splat files)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Request/Response Models
class GenerateRequest(BaseModel):
    prompt: str
    
class GenerateResponse(BaseModel):
    success: bool
    ply_url: Optional[str] = None
    image_url: Optional[str] = None
    message: Optional[str] = None
    generation_time_ms: Optional[int] = None


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "3d-scene-generator"}


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_scene(request: GenerateRequest, x_api_key: str = Header(..., alias="X-API-Key")):
    """
    Generate a 3D scene from a text prompt.
    
    Pipeline:
    1. Enhance prompt with depth/3D optimization keywords
    2. Generate 16:9 concept image via Gemini 2.5 Flash Image
    3. Convert to 3D Gaussian Splatting via Apple SHARP
    4. Convert PLY to .splat format for optimized web rendering
    5. Return URLs for frontend to render
    """
    import time
    start_time = time.time()
    
    # Set the API key from the request header
    os.environ["GOOGLE_API_KEY"] = x_api_key
    
    try:
        # Generate unique session ID
        session_id = str(uuid.uuid4())[:8]
        
        # Step 1: Generate concept image
        image_path = TEMP_DIR / f"{session_id}_concept.png"
        await generate_concept_image(request.prompt, str(image_path))
        
        if not image_path.exists():
            raise HTTPException(status_code=500, detail="Image generation failed")
        
        # Step 2: Generate 3D scene via SHARP
        output_dir = STATIC_DIR / session_id
        output_dir.mkdir(exist_ok=True)
        
        ply_path = await generate_3d_scene(str(image_path), str(output_dir))
        
        if not ply_path or not Path(ply_path).exists():
            raise HTTPException(status_code=500, detail="3D reconstruction failed")
        
        # Step 3: Convert PLY to optimized .splat format
        splat_path = str(output_dir / f"{session_id}.splat")
        final_path = await convert_ply_to_splat(ply_path, splat_path)
        
        # Copy image to static for preview
        static_image_path = output_dir / "concept.png"
        shutil.copy(image_path, static_image_path)
        
        # Calculate time
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        # Return URLs (use splat if conversion succeeded, otherwise PLY)
        scene_filename = Path(final_path).name
        return GenerateResponse(
            success=True,
            ply_url=f"/static/{session_id}/{scene_filename}",
            image_url=f"/static/{session_id}/concept.png",
            generation_time_ms=elapsed_ms,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
