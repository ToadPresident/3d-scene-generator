"""
Gemini 2.5 Flash Image Service
Generates high-quality concept images from text prompts.
"""

import os
from google import genai
from google.genai import types


# Initialize client (uses GOOGLE_API_KEY env var or Application Default Credentials)
client = genai.Client()


async def generate_concept_image(prompt: str, output_path: str) -> str:
    """
    Generate a 16:9 concept image optimized for 3D reconstruction.
    
    Args:
        prompt: User's scene description
        output_path: Path to save the generated image
        
    Returns:
        Path to the saved image
    """
    # Enhance prompt for optimal single-image 3D reconstruction
    # Generate panoramic, edge-filling composition to minimize black borders
    enhanced_prompt = (
        f"{prompt}, "
        "ultra wide angle 180 degree panoramic view, "
        "immersive first-person perspective filling the entire frame, "
        "no empty space at edges, content extending to all borders, "
        "everything in sharp focus from near to far, "
        "strong depth with objects at multiple distances, "
        "8k photorealistic, cinematic volumetric lighting"
    )
    
    # Generate image with 16:9 aspect ratio for immersive scenes
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
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
            return output_path
    
    raise RuntimeError("No image generated from Gemini API")
