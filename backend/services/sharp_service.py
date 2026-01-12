"""
Apple SHARP Service
Converts single images to 3D Gaussian Splatting via SHARP CLI.
"""

import asyncio
import subprocess
from pathlib import Path
from typing import Optional


async def generate_3d_scene(image_path: str, output_dir: str) -> Optional[str]:
    """
    Run Apple SHARP to convert image to 3D Gaussian Splat (.ply).
    
    SHARP uses OpenCV coordinate convention (x right, y down, z forward).
    The scene center is roughly at (0, 0, +z).
    
    Args:
        image_path: Path to input image
        output_dir: Directory for output files
        
    Returns:
        Path to generated .ply file, or None if failed
    """
    # Ensure output directory exists
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Run SHARP CLI in subprocess (CPU-bound, so we run in executor)
    # SHARP command: sharp predict -i <input> -o <output_dir>
    cmd = ["sharp", "predict", "-i", image_path, "-o", output_dir]
    
    # Run in thread pool to avoid blocking async event loop
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: subprocess.run(cmd, capture_output=True, text=True)
    )
    
    if result.returncode != 0:
        error_msg = result.stderr or result.stdout or "Unknown error"
        raise RuntimeError(f"SHARP failed: {error_msg}")
    
    # Find generated PLY file
    output_path = Path(output_dir)
    ply_files = list(output_path.glob("*.ply"))
    
    if not ply_files:
        raise RuntimeError("SHARP did not generate any .ply files")
    
    # Return the first (usually only) PLY file
    return str(ply_files[0])


async def convert_ply_to_splat(ply_path: str, output_path: str) -> str:
    """
    Convert PLY to compressed .splat format for faster web loading.
    
    This is optional - the frontend can load PLY directly via gsplat.js,
    but .splat files are more compact and load faster.
    
    Note: This requires additional tooling (e.g., gsplat CLI or Python converter).
    For now, we skip this step and serve PLY directly.
    """
    # TODO: Implement if needed for production
    # For now, return original PLY path
    return ply_path
