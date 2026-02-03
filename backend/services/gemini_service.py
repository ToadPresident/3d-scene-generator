"""
Gemini Image Service - Vertex AI Optimized
Supports both Gemini 3 Pro Image (Nano Banana Pro) and 2.5 Flash.
Automatically selects optimal region based on model availability.
"""

import os
from google import genai
from google.genai import types


# Model configuration with optimal regions
# Note: gemini-3-pro-image-preview requires special access
# Using gemini-2.5-flash-image as stable default
MODELS = {
    "high_quality": {
        "name": "gemini-2.5-flash-image",  # Stable, widely available
        "location": "us-central1",
        "description": "High quality image generation"
    },
    "fast": {
        "name": "gemini-2.5-flash-image",
        "location": "us-central1",
        "description": "Speed optimized, high throughput"
    }
}

# Default mode - use high quality for demos
DEFAULT_MODE = os.environ.get("GEMINI_MODE", "high_quality")


def get_client(mode: str = None):
    """
    Get Gemini client with optimal configuration.
    
    Prefers Vertex AI (lower latency, higher quotas) over AI Studio API key.
    
    Args:
        mode: "high_quality" for Gemini 3 Pro, "fast" for 2.5 Flash
        
    Returns:
        Tuple of (client, model_name)
    """
    mode = mode or DEFAULT_MODE
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    
    if project:
        # Vertex AI mode - uses ADC (Application Default Credentials)
        model_config = MODELS.get(mode, MODELS["high_quality"])
        print(f"🚀 Vertex AI mode: {model_config['name']} @ {model_config['location']}")
        
        client = genai.Client(
            vertexai=True,
            project=project,
            location=model_config["location"]
        )
        return client, model_config["name"]
    else:
        # AI Studio fallback - uses API key
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "No credentials configured. Set either:\n"
                "  - GOOGLE_CLOUD_PROJECT (for Vertex AI, recommended)\n"
                "  - GOOGLE_API_KEY (for AI Studio)"
            )
        
        print("ℹ️  AI Studio mode (API Key)")
        client = genai.Client(api_key=api_key)
        # AI Studio uses 2.5 Flash for image generation
        return client, "gemini-2.5-flash-image"


async def generate_concept_image(prompt: str, output_path: str, mode: str = None) -> str:
    """
    Generate a 16:9 concept image optimized for 3D reconstruction.
    
    Args:
        prompt: User's scene description
        output_path: Path to save the generated image
        mode: "high_quality" or "fast"
        
    Returns:
        Path to the saved image
    """
    client, model_name = get_client(mode)
    
    # Enhance prompt for optimal single-image 3D reconstruction
    # Panoramic composition minimizes black borders in 3D view
    enhanced_prompt = (
        f"{prompt}, "
        "ultra wide angle 180 degree panoramic view, "
        "immersive first-person perspective filling the entire frame, "
        "no empty space at edges, content extending to all borders, "
        "everything in sharp focus from near to far, "
        "strong depth with objects at multiple distances, "
        "8k photorealistic, cinematic volumetric lighting"
    )
    
    print(f"🎨 Generating image with {model_name}...")
    
    # Generate image with 16:9 aspect ratio for immersive scenes
    response = client.models.generate_content(
        model=model_name,
        contents=[enhanced_prompt],
        config=types.GenerateContentConfig(
            response_modalities=['Image'],
            image_config=types.ImageConfig(
                aspect_ratio="16:9",
            )
        )
    )
    
    # Extract and save image
    for part in response.parts:
        if part.inline_data is not None:
            image = part.as_image()
            image.save(output_path)
            print(f"✅ Image saved: {output_path}")
            return output_path
    
    raise RuntimeError(f"No image generated from {model_name}")
