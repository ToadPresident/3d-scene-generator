"""
PLY to .splat converter - using Antimatter15's official format.

This is adapted from: https://github.com/antimatter15/splat/blob/main/convert.py
"""

from plyfile import PlyData
import numpy as np
from io import BytesIO
from pathlib import Path


def convert_ply_to_splat(ply_path: str, splat_path: str) -> dict:
    """
    Convert SHARP PLY to .splat format using Antimatter15's official format.
    """
    print(f"Converting: {ply_path} -> {splat_path}")
    
    plydata = PlyData.read(ply_path)
    vert = plydata["vertex"]
    n = len(vert)
    
    print(f"Loaded {n:,} vertices")
    
    # Sort by importance (scale * opacity) - descending
    sorted_indices = np.argsort(
        -np.exp(vert["scale_0"] + vert["scale_1"] + vert["scale_2"])
        / (1 + np.exp(-vert["opacity"]))
    )
    
    buffer = BytesIO()
    valid_count = 0
    
    for idx in sorted_indices:
        v = vert[idx]
        
        # Position (12 bytes) - keep original coordinates
        position = np.array([v["x"], v["y"], v["z"]], dtype=np.float32)
        
        # Skip invalid positions
        if not np.all(np.isfinite(position)):
            continue
        
        # Scales (12 bytes) - apply exp transform
        scales = np.exp(
            np.array([v["scale_0"], v["scale_1"], v["scale_2"]], dtype=np.float32)
        )
        
        # Color (4 bytes) - from spherical harmonics + opacity
        SH_C0 = 0.28209479177387814
        color = np.array([
            0.5 + SH_C0 * v["f_dc_0"],
            0.5 + SH_C0 * v["f_dc_1"],
            0.5 + SH_C0 * v["f_dc_2"],
            1 / (1 + np.exp(-v["opacity"])),  # sigmoid for opacity
        ])
        
        # Rotation (4 bytes) - normalized quaternion
        rot = np.array(
            [v["rot_0"], v["rot_1"], v["rot_2"], v["rot_3"]], 
            dtype=np.float32
        )
        
        # Write to buffer
        buffer.write(position.tobytes())
        buffer.write(scales.tobytes())
        buffer.write((color * 255).clip(0, 255).astype(np.uint8).tobytes())
        buffer.write(
            ((rot / np.linalg.norm(rot)) * 128 + 128)
            .clip(0, 255)
            .astype(np.uint8)
            .tobytes()
        )
        
        valid_count += 1
    
    print(f"Valid vertices: {valid_count:,} / {n:,}")
    
    # Write file
    with open(splat_path, "wb") as f:
        f.write(buffer.getvalue())
    
    ply_size = Path(ply_path).stat().st_size
    splat_size = Path(splat_path).stat().st_size
    
    print(f"Converted: {ply_size/1e6:.1f}MB -> {splat_size/1e6:.1f}MB ({splat_size/ply_size*100:.0f}%)")
    
    return {
        "input_vertices": n,
        "output_vertices": valid_count,
        "ply_size": ply_size,
        "splat_size": splat_size,
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python ply_to_splat.py input.ply output.splat")
        sys.exit(1)
    
    result = convert_ply_to_splat(sys.argv[1], sys.argv[2])
    print(f"Result: {result}")
