"""
Apple SHARP Service
Converts single images to 3D Gaussian Splatting via SHARP CLI.

Note: This requires the conda environment with SHARP to be activated before running uvicorn.
Run: conda activate 3d-scene-gen
"""

import asyncio
import subprocess
import shutil
import os
from pathlib import Path
from typing import Optional


def check_sharp_available() -> bool:
    """Check if SHARP CLI is available in PATH."""
    result = subprocess.run(["which", "sharp"], capture_output=True, text=True)
    return result.returncode == 0


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
    import os
    
    # Ensure absolute paths
    image_path = os.path.abspath(image_path)
    output_dir = os.path.abspath(output_dir)
    
    # Verify input image exists
    if not os.path.exists(image_path):
        raise RuntimeError(f"Input image not found: {image_path}")
    
    # Ensure output directory exists
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # SHARP expects a directory of images, not a single file
    # Create a temp directory with the single image
    input_dir = Path(output_dir) / "input"
    input_dir.mkdir(exist_ok=True)
    
    # Copy or link the image to the input directory
    import shutil
    input_image_path = input_dir / Path(image_path).name
    if not input_image_path.exists():
        shutil.copy(image_path, input_image_path)
    
    # Run SHARP CLI
    # Check if SHARP is available
    if not check_sharp_available():
        raise RuntimeError(
            "SHARP CLI not found in PATH. Please activate the conda environment:\n"
            "  conda activate 3d-scene-gen\n"
            "Or run setup.sh to install all dependencies."
        )
    
    # SHARP command: sharp predict -i <input_dir> -o <output_dir>
    cmd = ["sharp", "predict", "-i", str(input_dir), "-o", output_dir]
    
    print(f"Running SHARP: {' '.join(cmd)}")
    
    # Run in thread pool to avoid blocking async event loop
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    )
    
    print(f"SHARP stdout: {result.stdout}")
    print(f"SHARP stderr: {result.stderr}")
    
    if result.returncode != 0:
        error_msg = result.stderr or result.stdout or "Unknown error"
        raise RuntimeError(f"SHARP failed: {error_msg}")
    
    # Find generated PLY file
    output_path = Path(output_dir)
    ply_files = list(output_path.glob("*.ply"))
    
    if not ply_files:
        # Check subdirectories too
        ply_files = list(output_path.rglob("*.ply"))
    
    if not ply_files:
        raise RuntimeError(f"SHARP did not generate any .ply files in {output_dir}")
    
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
