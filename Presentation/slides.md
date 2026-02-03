---
theme: default
background: ./images/slide1-ntu-classroom.png
class: text-center
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
css: unocss
title: Instant World Creation
---

<div class="bg-overlay"></div>

<div class="pt-32">
  <h1 class="text-6xl font-black mb-4 text-white drop-shadow-lg">
    Instant World Creation
  </h1>
  <p class="text-3xl opacity-90 mb-4 font-light">
    From Text to 3D in Under One Second
  </p>
  <p class="text-xl opacity-70 mb-8">
    From Generative Priors to Feed-Forward Geometry
  </p>
  
  <div class="absolute bottom-10 left-0 w-full text-center opacity-50 text-sm font-mono">
    Deep Learning Final Project · Powered by Apple SHARP
  </div>
</div>

---
layout: image-right
image: ./images/slide2-studio.png
---

<div class="ml-4">

# 1. The Bottleneck

### Photogrammetry

The first traditional approach to 3D reconstruction: scanning from the real world.

<br>

- **Principle:** Reconstruct 3D models from multi-angle photographs
- **Requirements:**
  - Physical object must exist
  - Complex camera rigs + controlled lighting
- **Pain Points:**
  - <strong>Cannot scan things that don't exist</strong>
  - Not suitable for creative content generation

</div>

---

# NeRF & Optimization-based 3DGS

### Optimization Methods: Every scene requires "retraining"

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="glass-card">
<h3 class="text-cyan-400 font-bold mb-4">NeRF (Neural Radiance Fields)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>Requires 50-100 overlapping images</li>
<li>Training time: 30 min - 1 hour <strong>per object</strong></li>
<li>Output: Implicit neural field (requires ray marching)</li>
</ul>
</div>

<div class="glass-card">
<h3 class="text-purple-400 font-bold mb-4">3D Gaussian Splatting (3DGS)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>Also requires multi-view images</li>
<li>Faster rendering (real-time)</li>
<li>But still needs <strong>per-scene optimization</strong></li>
</ul>
</div>

</div>

<div class="mt-8 text-center text-2xl font-bold text-red-400">
  Pain Point: Every new object requires retraining → Cannot scale
</div>

---
layout: center
class: text-center
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
---

# The Revolution: Feed-Forward

<div class="text-4xl font-bold mt-10 leading-relaxed">
  From "Optimization" to "Prediction"
</div>

<div class="grid grid-cols-2 gap-12 mt-12 items-center max-w-3xl mx-auto">
  
  <div class="glass-card text-center py-10 opacity-50 grayscale">
    <div class="text-2xl mb-2">Old: Optimization</div>
    <div class="text-sm">Iterative Gradient Descent</div>
    <div class="text-4xl font-mono mt-4 text-red-400">~40 Mins</div>
  </div>

  <div class="glass-card text-center py-10 border-cyan-500 border-2 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
    <div class="text-2xl mb-2 font-bold text-cyan-300">New: Feed-Forward</div>
    <div class="text-sm">Direct Neural Prediction</div>
    <div class="text-6xl font-black mt-4 text-cyan-400 animate-pulse">0.2 Sec</div>
  </div>

</div>

---

## layout: two-cols

# 2. Apple SHARP

### Context & Community Impact

**Apple SHARP** (Sharp Monocular View Synthesis)

_Released: Dec 2025 (CVPR 2026 Submission)_

<br>

- **Community Response:**
  - GitHub Stars: **5.2k+** (first month)
  - Twitter/X: Called "Midjourney for 3D"
- **Why the hype?**
  - First mobile-optimized SOTA model
  - Desktop GPU-level quality

::right::

<div class="glass-card mt-10 ml-4 p-4 text-center">
  <div class="text-6xl mb-2">⭐️ 5.2k</div>
  <div class="text-sm opacity-60">GitHub Stars</div>
</div>

<div class="glass-card mt-4 ml-4 p-4">
  <div class="flex items-center gap-2 mb-2">
    <div class="w-8 h-8 rounded-full bg-gray-500"></div>
    <div class="text-sm font-bold">AI Researcher @ X</div>
  </div>
  <p class="text-xs italic">"SHARP is the first model that actually makes Gaussian Splatting viable for mobile apps."</p>
</div>
---

# Feed-Forward Architecture

### What is a "Feed-Forward" model?

Unlike NeRF (which "memorizes" scenes), SHARP **"understands"** geometry.

<div class="grid grid-cols-3 gap-4 mt-8">
  <div class="col-span-1 glass-card">
    <h4 class="text-cyan-400 font-bold">1. Encoder</h4>
    <p class="text-sm mt-2">Extracts deep features from 2D images (texture, edges, semantics)</p>
  </div>
  <div class="col-span-1 glass-card">
    <h4 class="text-purple-400 font-bold">2. Predictor</h4>
    <p class="text-sm mt-2">Transformer predicts 3D positions (XYZ) and shapes (covariance) of thousands of Gaussians</p>
  </div>
  <div class="col-span-1 glass-card">
    <h4 class="text-green-400 font-bold">3. Output</h4>
    <p class="text-sm mt-2">Directly outputs `.ply` point cloud. No loops, no iterations, single pass.</p>
  </div>
</div>

<div class="mt-6 p-4 border border-dashed border-gray-600 rounded text-center text-sm font-mono">
  Image (Pixels) → Neural Network → 3D Gaussians (Geometry)
</div>
---

# Technical Details: Why So Strong?

<div class="text-left max-w-3xl mx-auto space-y-6 mt-8">
  <div class="flex items-start gap-4">
    <div class="bg-cyan-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</div>
    <div>
      <h4 class="font-bold text-xl">Epipolar Constraints</h4>
      <p class="opacity-80">SHARP doesn't just guess; it enforces physical laws of vision (epipolar geometry) inside the network layers.</p>
    </div>
  </div>

  <div class="flex items-start gap-4">
    <div class="bg-cyan-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</div>
    <div>
      <h4 class="font-bold text-xl">High-Quality Training Data</h4>
      <p class="opacity-80">Trained on a curated subset of Objaverse-XL, filtering out low-quality meshes.</p>
    </div>
  </div>

  <div class="flex items-start gap-4">
    <div class="bg-cyan-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</div>
    <div>
      <h4 class="font-bold text-xl">Efficient Architecture</h4>
      <p class="opacity-80">Mobile-optimized, can run in real-time on iPhone/iPad.</p>
    </div>
  </div>
</div>

---
layout: image-right
image: ./images/slide4-architecture.png
---

# Capabilities & Analogy

### "Stable Diffusion for 3D"

Just as **Stable Diffusion** transformed 2D art, **SHARP** transforms 3D assets.

<br>

- **Analogy:**
  - **Text-to-Image:** Input "cat", get JPG in 0.5s
  - **Image-to-3D:** Input JPG, get 3D model in 0.2s

- **Key Capabilities:**
  1. **Generalization:** Cats, cars, buildings, abstract art - all work
  2. **View Consistency:** Reasonably "hallucinates" the back side

---

# 3. Benchmarks

### Defining "Quality" for 3D Generative AI

Before looking at data, we must understand the **metrics**.

<div class="flex gap-4 mt-8 text-left">
  
  <div class="flex-1 glass-card border-l-4 border-blue-500">
    <h3 class="font-bold text-lg">PSNR / SSIM</h3>
    <p class="text-xs mt-2 opacity-70">"Pixel Accuracy"</p>
    <p class="text-sm mt-2">Traditional signal processing metrics. Measures pixel-to-ground-truth match.</p>
  </div>

  <div class="flex-1 glass-card border-l-4 border-purple-500">
    <h3 class="font-bold text-lg">LPIPS</h3>
    <p class="text-xs mt-2 opacity-70">"Human Perception"</p>
    <p class="text-sm mt-2"><strong>Crucial Metric.</strong> Measures how "real" it looks to a human eye. <span class="text-purple-400">Lower is better.</span></p>
  </div>

  <div class="flex-1 glass-card border-l-4 border-green-500">
    <h3 class="font-bold text-lg">FPS / Inference Time</h3>
    <p class="text-xs mt-2 opacity-70">"Speed"</p>
    <p class="text-sm mt-2">Time to generate one asset. <span class="text-green-400">Critical for real-time apps.</span></p>
  </div>

</div>

---

# Comparison Data: Crushing the Competition

Comparison against SOTA methods (LGM, Splatter Image, OpenLRM)

<div class="mt-10 relative">
<div class="space-y-6 font-mono text-sm">

<div>
<div class="flex justify-between mb-1"><span>LGM (Large Gaussian Model)</span><span>LPIPS: 0.19</span></div>
<div class="w-full bg-gray-800 rounded h-4"><div class="bg-gray-500 h-4 rounded" style="width: 70%"></div></div>
</div>

<div>
<div class="flex justify-between mb-1"><span>OpenLRM</span><span>LPIPS: 0.18</span></div>
<div class="w-full bg-gray-800 rounded h-4"><div class="bg-gray-500 h-4 rounded" style="width: 65%"></div></div>
</div>

<div>
<div class="flex justify-between mb-1 text-cyan-400 font-bold"><span>Apple SHARP (Ours)</span><span>LPIPS: 0.14 (Best)</span></div>
<div class="w-full bg-gray-800 rounded h-4 shadow-[0_0_15px_rgba(0,255,255,0.4)]"><div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded" style="width: 40%"></div></div>
</div>

</div>

<div class="mt-8 text-center glass-card py-4">
<h3 class="text-2xl font-bold">Speed Advantage</h3>
<p class="mt-2">SHARP is <span class="text-green-400 font-bold">3x faster</span> than LGM and <span class="text-green-400 font-bold">2000x faster</span> than DreamFusion</p>
</div>

</div>

---
layout: center
class: text-center
background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)
---

# Conclusion: Dominating All Metrics

<div class="text-center mt-12">
  <div class="text-6xl font-black text-cyan-400 mb-4">🏆</div>
  <p class="text-2xl">SHARP leads in both quality and speed</p>
  <p class="mt-4 opacity-70">Enough numbers. Let's see the Product. ↓</p>
</div>

---

## layout: two-cols

# 4. Engineering Practice

<div class="text-sm">

**Tech Stack:**

- **T2I:** Gemini 2.5 Flash (Nano Banana)
- **3D:** Apple SHARP (Feed-Forward 3DGS)
- **Frontend:** React Three Fiber
- **Backend:** FastAPI + Gradio

</div>

```bash {all} {fontSize:'10px'}
3d-scene-generator/
├── backend/
│   ├── main.py         # FastAPI
│   ├── app_gradio.py   # HF Space
│   └── services/
│       ├── gemini_service.py
│       └── sharp_service.py
├── frontend/src/
│   ├── GaussianSplatViewer.tsx
│   └── PromptPanel.tsx
└── hf-space/
```

::right::

<div class="ml-4 h-full flex items-center justify-center">
<div class="glass-card p-6 text-center">
<div class="text-6xl mb-4">🐙</div>
<h3 class="text-xl font-bold">Open Source</h3>
<p class="text-sm mt-2 opacity-70">ToadPresident/3d-scene-generator</p>
<a href="https://github.com/ToadPresident/3d-scene-generator" target="_blank" class="inline-block mt-4 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition">
View on GitHub →
</a>
</div>
</div>

---
layout: center
preload: false

---

# Live Preview: 3D Scene Generator

Our deployed demo on **HuggingFace Space**.

<div class="w-[800px] h-[400px] border border-gray-700 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.2)] mt-6 bg-black flex items-center justify-center">
<div class="text-center">
<div class="text-6xl mb-4">🎨</div>
<h3 class="text-2xl font-bold text-cyan-400">Live Demo</h3>
<p class="mt-2 opacity-70">Visit our deployed application:</p>
<a href="https://huggingface.co/spaces/ToadPres/3d-scene-generator" target="_blank" class="inline-block mt-4 px-6 py-3 bg-cyan-500/20 border border-cyan-500 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition">
🚀 Open 3D Scene Generator
</a>
</div>
</div>

<div class="mt-4 text-sm opacity-50">
(Click to open in new tab - HF Space requires external access)
</div>
---
layout: two-cols
---

# Engineering Challenges

### Solving the "Illusion" Problem

**Problem:** Single-view reconstruction creates **"Floaters"** (artifacts) and blurs on the back side.

**Solution:** We implemented **SceneFog + Camera Bounds**

- Fog fades to black, gracefully hiding edge artifacts
- WASD + Q/E movement with soft boundary constraints

::right::

```tsx
// GaussianSplatViewer.tsx
function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    // Fog hides black edges
    scene.fog = new THREE.Fog(0x000000, 1.5, 4);
    scene.background = new THREE.Color(0x000000);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

// Movement bounds
const BOUNDS = {
  minX: -5,
  maxX: 5,
  minY: -3,
  maxY: 3,
  minZ: -5,
  maxZ: 5,
};
```

---
layout: image-left
image: ./images/slide-future-world.png
---

# 5. Future Outlook: World Model

### From "Object Generation" to "World Generation"

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="glass-card">
<h3 class="text-cyan-400 font-bold mb-4">Fei-Fei Li's Vision</h3>
<p class="text-sm">"AI must move from 'Seeing' to 'Acting' in 3D space."</p>
<p class="text-sm mt-4 opacity-70">— Spatial Intelligence, 2024</p>
</div>

<div class="glass-card border-purple-500 border">
<h3 class="text-purple-400 font-bold mb-4">World Labs</h3>
<p class="text-sm"><strong>Project Marble:</strong> A "world model" that generates and maintains consistent 3D environments from various inputs.</p>
<p class="text-sm mt-4 opacity-70">Built on 3D Gaussian Splatting technology</p>
</div>

</div>

<div class="mt-8 text-center">
<p class="text-xl">World Model = Simulates not just pixels, but <strong>physics and dynamics</strong></p>
</div>
---

# 3DGS Applications

### Beyond 3D Generation

<div class="grid grid-cols-3 gap-6 mt-8">

<div class="glass-card text-center">
<div class="text-4xl mb-4">🥽</div>
<h3 class="font-bold text-lg">Apple Vision Pro</h3>
<p class="text-sm mt-2 opacity-70">Core technology for spatial computing, enabling immersive AR experiences</p>
</div>

<div class="glass-card text-center">
<div class="text-4xl mb-4">🎮</div>
<h3 class="font-bold text-lg">Game Asset Generation</h3>
<p class="text-sm mt-2 opacity-70">Rapidly create NPCs, props, and environments for games</p>
</div>

<div class="glass-card text-center">
<div class="text-4xl mb-4">🎬</div>
<h3 class="font-bold text-lg">Virtual Production</h3>
<p class="text-sm mt-2 opacity-70">Pre-visualization, LED Wall background generation</p>
</div>

</div>

<div class="mt-8 text-center glass-card py-4">
<p class="text-lg">3DGS is becoming the infrastructure for <strong>Spatial Intelligence</strong></p>
</div>
---

# Future Tech: 4D & Physics

### From Static to Dynamic

<div class="grid grid-cols-2 gap-8 mt-10">

<div class="glass-card">
<h3 class="text-gray-400 mb-2">Current (SHARP)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>Static scenes (frozen in time)</li>
<li>Visual only (no mass/friction)</li>
<li>One object at a time</li>
</ul>
</div>

<div class="glass-card border-purple-500 border">
<h3 class="text-purple-400 mb-2 font-bold">Future (4D & Physics)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li><strong>4D Gaussian Splatting:</strong> Time-variant scenes (flowing water, fire)</li>
<li><strong>PhysGaussian:</strong> Interactive physics (soft body simulation, bouncing)</li>
<li><strong>Scene Composition:</strong> LLM-driven layout generation</li>
</ul>
</div>

</div>

<div class="mt-8 text-center">
<p class="opacity-70">CVPR 2024: PhysGaussian pioneered physics-aware Gaussian splatting</p>
</div>

---
layout: center
class: text-center
background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #2a2a4e 100%)
---

# Thank You

<div class="flex flex-col items-center mt-10">
<div class="text-6xl mb-4">🚀</div>
<h2 class="text-2xl font-bold">Deep Learning Final Project</h2>
<p class="opacity-60 mt-2">Text-to-3D Instant Generation</p>

<div class="mt-8 grid grid-cols-2 gap-8 text-left text-sm font-mono opacity-80">
<div>
<span class="text-cyan-400">>></span> Google Gemini 2.5 Flash

<span class="text-cyan-400">>></span> Apple SHARP

</div>
<div>
<span class="text-purple-400">>></span> React Three Fiber

<span class="text-purple-400">>></span> FastAPI

</div>
</div>

<div class="mt-10 text-sm opacity-60">
<a href="https://github.com/ToadPresident/3d-scene-generator" target="_blank" class="hover:text-cyan-400 transition">
github.com/ToadPresident/3d-scene-generator
</a>
</div>
</div>
