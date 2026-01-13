"""
3D Scene Generator - Gradio App with ZeroGPU + FastAPI API
Supports both Gradio interface and REST API for Vercel frontend
"""

import os
import uuid
import shutil
import tempfile
from pathlib import Path
from typing import Optional

import spaces
import gradio as gr
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import services
from services.gemini_service import generate_concept_image
from services.sharp_service import generate_3d_scene, convert_ply_to_splat

# Create directories
STATIC_DIR = Path("static")
TEMP_DIR = Path("temp")
STATIC_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)


# ============== FastAPI Section ==============

app = FastAPI(title="3D Scene Generator API")

# CORS for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


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
    return {"status": "healthy", "service": "3d-scene-generator"}


@app.post("/api/generate", response_model=GenerateResponse)
async def api_generate_scene(
    request: GenerateRequest, 
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """REST API endpoint for Vercel frontend"""
    import time
    start_time = time.time()
    
    os.environ["GOOGLE_API_KEY"] = x_api_key
    
    try:
        session_id = str(uuid.uuid4())[:8]
        
        # Generate image
        image_path = TEMP_DIR / f"{session_id}_concept.png"
        await generate_concept_image(request.prompt, str(image_path))
        
        if not image_path.exists():
            raise HTTPException(status_code=500, detail="Image generation failed")
        
        # Generate 3D
        output_dir = STATIC_DIR / session_id
        output_dir.mkdir(exist_ok=True)
        
        ply_path = await generate_3d_scene(str(image_path), str(output_dir))
        
        if not ply_path or not Path(ply_path).exists():
            raise HTTPException(status_code=500, detail="3D reconstruction failed")
        
        # Convert to splat
        splat_path = str(output_dir / f"{session_id}.splat")
        final_path = await convert_ply_to_splat(ply_path, splat_path)
        
        # Copy image to static
        static_image_path = output_dir / "concept.png"
        shutil.copy(image_path, static_image_path)
        
        elapsed_ms = int((time.time() - start_time) * 1000)
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


# ============== Gradio Section ==============

@spaces.GPU(duration=120)
def gradio_generate_scene(prompt: str, api_key: str):
    """Gradio interface function with GPU access"""
    
    if not api_key or not api_key.strip():
        return None, None, "❌ Please provide your Gemini API Key"
    
    if not prompt or not prompt.strip():
        return None, None, "❌ Please provide a scene description"
    
    os.environ["GOOGLE_API_KEY"] = api_key.strip()
    
    try:
        session_id = str(uuid.uuid4())[:8]
        temp_dir = Path(tempfile.mkdtemp())
        output_dir = temp_dir / session_id
        output_dir.mkdir(exist_ok=True)
        
        # Generate image
        image_path = temp_dir / f"{session_id}_concept.png"
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(generate_concept_image(prompt, str(image_path)))
        loop.close()
        
        if not image_path.exists():
            return None, None, "❌ Image generation failed"
        
        # Generate 3D
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        ply_path = loop.run_until_complete(generate_3d_scene(str(image_path), str(output_dir)))
        loop.close()
        
        if not ply_path or not Path(ply_path).exists():
            return None, None, "❌ 3D reconstruction failed"
        
        # Convert to splat
        splat_path = str(output_dir / f"{session_id}.splat")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        final_path = loop.run_until_complete(convert_ply_to_splat(ply_path, splat_path))
        loop.close()
        
        return str(image_path), final_path, "✅ Generated successfully!"
        
    except Exception as e:
        return None, None, f"❌ Error: {str(e)}"


# Create Gradio interface
with gr.Blocks(title="3D Scene Generator") as demo:
    gr.Markdown("""
    # 🌌 3D Scene Generator
    Transform text prompts into 3D environments using Gemini + SHARP
    
    **Instructions:**
    1. Enter your Gemini API Key ([Get one free](https://aistudio.google.com/apikey))
    2. Describe your scene
    3. Click Generate!
    """)
    
    with gr.Row():
        api_key = gr.Textbox(
            label="Gemini API Key",
            type="password",
            placeholder="Enter your API key..."
        )
    
    with gr.Row():
        prompt = gr.Textbox(
            label="Scene Description",
            placeholder="e.g., Cyberpunk alley with neon signs and rain reflections",
            lines=3
        )
    
    with gr.Row():
        generate_btn = gr.Button("🚀 Generate 3D Scene", variant="primary")
    
    with gr.Row():
        status = gr.Textbox(label="Status", interactive=False)
    
    with gr.Row():
        image_output = gr.Image(label="Generated Concept Image")
        file_output = gr.File(label="Download 3D Scene (.splat)")
    
    generate_btn.click(
        fn=gradio_generate_scene,
        inputs=[prompt, api_key],
        outputs=[image_output, file_output, status]
    )
    
    gr.Markdown("""
    ---
    **Note:** Uses ZeroGPU - may queue briefly during busy times.
    
    [GitHub](https://github.com/ToadPresident/3d-scene-generator) | 
    [Frontend Demo](https://3d-scene-generator.vercel.app)
    """)


# Mount Gradio app to FastAPI
app = gr.mount_gradio_app(app, demo, path="/")
