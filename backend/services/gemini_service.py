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
    # Enhance prompt for 3D reconstruction quality
    enhanced_prompt = (
        f"{prompt}, "
        "ultra wide angle lens, strong depth of field, "
        "cinematic lighting, volumetric atmosphere, "
        "8k photorealistic, single point perspective, "
        "clear foreground midground background separation"
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
