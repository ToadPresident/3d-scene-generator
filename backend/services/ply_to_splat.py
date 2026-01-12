"""
PLY to .splat converter for SHARP output.

Uses plyfile library for robust PLY parsing.
Converts to antimatter15/splat standard format.

Format per splat (32 bytes):
  - position: float32 x 3 = 12 bytes
  - scale: float32 x 3 = 12 bytes  
  - color: uint8 x 4 = 4 bytes (RGBA)
  - rotation: uint8 x 4 = 4 bytes (quaternion)
"""

import struct
import numpy as np
from pathlib import Path


def sigmoid(x: np.ndarray) -> np.ndarray:
    """Sigmoid activation for opacity."""
    return 1.0 / (1.0 + np.exp(-np.clip(x, -20, 20)))


def sh_to_rgb(sh: np.ndarray) -> np.ndarray:
    """Convert 0th order spherical harmonic (f_dc) to RGB."""
    C0 = 0.28209479177387814
    rgb = 0.5 + C0 * sh
    return np.clip(rgb, 0, 1)


def normalize_quaternion(q: np.ndarray) -> np.ndarray:
    """Normalize quaternion array."""
    norm = np.linalg.norm(q, axis=1, keepdims=True)
    norm = np.where(norm > 0, norm, 1)
    return q / norm


def convert_ply_to_splat(ply_path: str, splat_path: str) -> dict:
    """
    Convert SHARP PLY to .splat format.
    
    Args:
        ply_path: Path to input PLY file from SHARP
        splat_path: Path to output .splat file
        
    Returns:
        Dict with conversion stats
    """
    try:
        from plyfile import PlyData
    except ImportError:
        print("plyfile not installed, using fallback parser")
        return _convert_fallback(ply_path, splat_path)
    
    print(f"Converting: {ply_path} -> {splat_path}")
    
    # Read PLY
    plydata = PlyData.read(ply_path)
    vertex = plydata['vertex']
    n = len(vertex)
    
    print(f"Loaded {n:,} vertices")
    
    # Extract position (flip Y and Z for web coordinate system)
    x = vertex['x'].astype(np.float32)
    y = -vertex['y'].astype(np.float32)  # Flip Y
    z = -vertex['z'].astype(np.float32)  # Flip Z
    
    # Extract scale (log scale from SHARP)
    try:
        scale_0 = vertex['scale_0'].astype(np.float32)
        scale_1 = vertex['scale_1'].astype(np.float32)
        scale_2 = vertex['scale_2'].astype(np.float32)
    except ValueError:
        scale_0 = scale_1 = scale_2 = np.full(n, -5.0, dtype=np.float32)
    
    # Extract color from spherical harmonics
    try:
        f_dc = np.stack([
            vertex['f_dc_0'],
            vertex['f_dc_1'],
            vertex['f_dc_2']
        ], axis=1).astype(np.float32)
        rgb = sh_to_rgb(f_dc)
    except ValueError:
        rgb = np.full((n, 3), 0.7, dtype=np.float32)
    
    # Extract opacity
    try:
        opacity_raw = vertex['opacity'].astype(np.float32)
        opacity = sigmoid(opacity_raw)
    except ValueError:
        opacity = np.ones(n, dtype=np.float32)
    
    # Extract rotation quaternion
    try:
        rot = np.stack([
            vertex['rot_0'],
            vertex['rot_1'],
            vertex['rot_2'],
            vertex['rot_3']
        ], axis=1).astype(np.float32)
        rot = normalize_quaternion(rot)
    except ValueError:
        rot = np.zeros((n, 4), dtype=np.float32)
        rot[:, 0] = 1  # Identity quaternion
    
    # Filter invalid points
    valid = np.isfinite(x) & np.isfinite(y) & np.isfinite(z)
    valid_count = np.sum(valid)
    
    print(f"Valid vertices: {valid_count:,} / {n:,}")
    
    # Apply filter
    x, y, z = x[valid], y[valid], z[valid]
    scale_0, scale_1, scale_2 = scale_0[valid], scale_1[valid], scale_2[valid]
    rgb, opacity, rot = rgb[valid], opacity[valid], rot[valid]
    
    # Sort by depth (Z) for better rendering
    sort_idx = np.argsort(z)
    x, y, z = x[sort_idx], y[sort_idx], z[sort_idx]
    scale_0, scale_1, scale_2 = scale_0[sort_idx], scale_1[sort_idx], scale_2[sort_idx]
    rgb, opacity, rot = rgb[sort_idx], opacity[sort_idx], rot[sort_idx]
    
    # Write .splat file
    # Standard format: pos(3f) + scale(3f) + rgba(4B) + rot(4B) = 32 bytes per splat
    with open(splat_path, 'wb') as f:
        for i in range(valid_count):
            # Position (12 bytes)
            f.write(struct.pack('<fff', x[i], y[i], z[i]))
            # Scale (12 bytes)
            f.write(struct.pack('<fff', scale_0[i], scale_1[i], scale_2[i]))
            # RGBA (4 bytes)
            r = int(rgb[i, 0] * 255)
            g = int(rgb[i, 1] * 255)
            b = int(rgb[i, 2] * 255)
            a = int(opacity[i] * 255)
            f.write(struct.pack('BBBB', r, g, b, a))
            # Rotation as bytes (4 bytes) - map [-1,1] to [0,255]
            rot_bytes = ((rot[i] + 1) * 127.5).astype(np.uint8)
            f.write(struct.pack('BBBB', *rot_bytes))
    
    ply_size = Path(ply_path).stat().st_size
    splat_size = Path(splat_path).stat().st_size
    
    print(f"Converted: {ply_size/1e6:.1f}MB -> {splat_size/1e6:.1f}MB ({splat_size/ply_size*100:.0f}%)")
    
    return {
        "input_vertices": n,
        "output_vertices": int(valid_count),
        "ply_size": ply_size,
        "splat_size": splat_size,
    }


def _convert_fallback(ply_path: str, splat_path: str) -> dict:
    """Fallback converter without plyfile dependency."""
    # This is a simplified version - install plyfile for full support
    print("WARNING: Using fallback converter. Install plyfile for better results.")
    
    with open(ply_path, 'rb') as f:
        data = f.read()
    
    # Find header
    header_end = data.find(b'end_header\n')
    if header_end == -1:
        raise ValueError("Invalid PLY file")
    
    header = data[:header_end].decode('utf-8')
    vertex_count = 0
    for line in header.split('\n'):
        if line.startswith('element vertex'):
            vertex_count = int(line.split()[2])
            break
    
    if vertex_count == 0:
        raise ValueError("No vertices found")
    
    # Just copy the PLY as-is for now (frontend will handle it)
    import shutil
    shutil.copy(ply_path, splat_path.replace('.splat', '.ply'))
    
    return {"input_vertices": vertex_count, "output_vertices": 0, "fallback": True}


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python ply_to_splat.py input.ply output.splat")
        sys.exit(1)
    
    result = convert_ply_to_splat(sys.argv[1], sys.argv[2])
    print(f"Result: {result}")
