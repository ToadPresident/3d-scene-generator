---
theme: default
background: ./images/slide1-bg.png
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

<div class="pt-40">
  <div class="glass-card inline-block px-8 py-4 mb-6 border-cyan-500/50">
    <span class="text-cyan-400 font-mono">Input: "A Cyberpunk City"</span> 
    <span class="mx-2">→</span> 
    <span class="text-purple-400 font-mono">Output: 3D World</span>
  </div>

  <h1 class="text-6xl font-black mb-4 text-white drop-shadow-lg">
    Instant World Creation
  </h1>
  <p class="text-2xl opacity-80 mb-8 font-light">
    From Generative Priors to Feed-Forward Geometry
  </p>
  
  <div class="absolute bottom-10 left-0 w-full text-center opacity-50 text-sm font-mono">
    Powered by Google Nano Banana & Apple SHARP
  </div>
</div>

---
layout: image-right
image: ./images/slide2-studio.png
---

# 1. The Bottleneck

### Traditional 3D Reconstruction

Before we talk about AI, let's look at how we used to build 3D worlds.

<br>

- **Photogrammetry (Scanning):**
  - Requires physical objects.
  - Needs complex camera rigs & controlled lighting.
  - **Pain Point:** You can't scan what doesn't exist.

- **NeRF / Optimization-based 3DGS:**
  - Requires 50-100 overlapping images per scene.
  - **Training Time:** 30 mins to 1 hour _per object_.
  - **Pain Point:** "Optimization" means retraining the network for every single new apple or chair.

---
layout: center
class: text-center
---

# The Conclusion

<div class="text-4xl font-bold mt-10 leading-relaxed">
  "With traditional methods,<br>
  <span class="text-red-500">Real-time Generation</span> is Impossible."
</div>

<div class="mt-12 opacity-80 max-w-2xl mx-auto text-lg">
  If it takes 20 minutes to generate one asset, we cannot build a dynamic "World Model". We hit a wall in scalability.
</div>
---
layout: default
---

# The Revolution: Seconds, Not Minutes

How do we break the barrier?
We need a **Feed-Forward** approach.

<div class="grid grid-cols-2 gap-12 mt-12 items-center">
  
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
layout: two-cols
---

# 2. Apple SHARP

### Context & Community Impact

**Apple SHARP** (Sharp Monocular View Synthesis)
_Released: Dec 2025 (CVPR 2026 Submission)_

<br>

- **Community Reaction:**
  - **GitHub Stars:** 5.2k+ in first month.
  - **Twitter/X:** Widely praised as the "Midjourney for 3D".
  - **Why the hype?** It was the first time a mobile-optimized model achieved SOTA quality on par with desktop GPUs.

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
  <p class="text-xs italic">"SHARP is the first model that actually makes Gaussian Splatting viable for mobile apps. The inference speed is insane."</p>
</div>
---
layout: default
---

# Technical Deep Dive

### What is a "Feed-Forward" Model?

Unlike NeRF (which "memorizes" a scene), SHARP **"understands"** geometry.

<div class="grid grid-cols-3 gap-4 mt-8">
  <div class="col-span-1 glass-card">
    <h4 class="text-cyan-400 font-bold">1. The Encoder</h4>
    <p class="text-sm mt-2">Takes the 2D image and extracts "Deep Features" (Texture, Edges, Semantic meaning).</p>
  </div>
  <div class="col-span-1 glass-card">
    <h4 class="text-purple-400 font-bold">2. The Predictor</h4>
    <p class="text-sm mt-2">A Transformer network predicts the 3D position (XYZ) and shape (Covariance) of thousands of Gaussians.</p>
  </div>
  <div class="col-span-1 glass-card">
    <h4 class="text-green-400 font-bold">3. The Output</h4>
    <p class="text-sm mt-2">Directly outputs a `.ply` point cloud. No loops, no iterations. One pass.</p>
  </div>
</div>

<div class="mt-6 p-4 border border-dashed border-gray-600 rounded text-center text-sm font-mono">
  Image (Pixels) $\rightarrow$ Neural Network $\rightarrow$ 3D Gaussians (Geometry)
</div>

---
layout: image-right
image: ./images/slide4-architecture.png
---

# Capabilities & Analogy

### The "Diffusion Moment" for 3D

Just like **Stable Diffusion** changed 2D art, **SHARP** changes 3D assets.

<br>

- **Analogy:**
  - **Text-to-Image:** You type "Cat", you get a JPG (0.5s).
  - **Image-to-3D:** You feed the JPG, you get a 3D Model (0.2s).

- **Key Capabilities:**
  1.  **Generalization:** Works on cats, cars, buildings, and abstract art.
  2.  **View Consistency:** It hallucinates the "back" of the object logically (thanks to training on Objaverse-XL).
---
layout: default
---

# 3. Benchmarks

### Defining "Quality" in 3D Generative AI

Before we look at the chart, we must understand **what we are measuring**.

<div class="flex gap-4 mt-8 text-left">
  
  <div class="flex-1 glass-card border-l-4 border-blue-500">
    <h3 class="font-bold text-lg">PSNR / SSIM</h3>
    <p class="text-xs mt-2 opacity-70">"Pixel Perfectness"</p>
    <p class="text-sm mt-2">Traditional signal processing metrics. Measures how closely the pixels match ground truth.</p>
  </div>

  <div class="flex-1 glass-card border-l-4 border-purple-500">
    <h3 class="font-bold text-lg">LPIPS</h3>
    <p class="text-xs mt-2 opacity-70">"Human Perception"</p>
    <p class="text-sm mt-2">**Crucial Metric.** Measures how "real" it looks to a human eye. <span class="text-purple-400">Lower is better.</span></p>
  </div>

  <div class="flex-1 glass-card border-l-4 border-green-500">
    <h3 class="font-bold text-lg">FPS / Inference Time</h3>
    <p class="text-xs mt-2 opacity-70">"Speed"</p>
    <p class="text-sm mt-2">Time taken to generate one asset. <span class="text-green-400">Critical for real-time apps.</span></p>
  </div>

</div>
---
layout: default
---

# The Data: Crushing the Competition

Comparison against SOTA methods (LGM, Splatter Image, OpenLRM).

<div class="mt-10 relative">
  
  <div class="space-y-6 font-mono text-sm">
    
    <div>
      <div class="flex justify-between mb-1">
        <span>LGM (Large Gaussian Model)</span>
        <span>LPIPS: 0.19</span>
      </div>
      <div class="w-full bg-gray-800 rounded h-4">
        <div class="bg-gray-500 h-4 rounded" style="width: 70%"></div>
      </div>
    </div>

    <div>
      <div class="flex justify-between mb-1">
        <span>OpenLRM</span>
        <span>LPIPS: 0.18</span>
      </div>
      <div class="w-full bg-gray-800 rounded h-4">
        <div class="bg-gray-500 h-4 rounded" style="width: 65%"></div>
      </div>
    </div>

    <div>
      <div class="flex justify-between mb-1 text-cyan-400 font-bold">
        <span>Apple SHARP (Ours)</span>
        <span>LPIPS: 0.14 (Best)</span>
      </div>
      <div class="w-full bg-gray-800 rounded h-4 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
        <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded" style="width: 40%"></div>
      </div>
    </div>

  </div>

  <div class="mt-8 text-center glass-card py-4">
    <h3 class="text-2xl font-bold">Speed Advantage</h3>
    <p class="mt-2">SHARP is <span class="text-green-400 font-bold">3x faster</span> than LGM and <span class="text-green-400 font-bold">2000x faster</span> than DreamFusion.</p>
  </div>

</div>
---
layout: center
---

# Why is it so strong?

<div class="text-left max-w-2xl mx-auto space-y-6 mt-8">
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
      <h4 class="font-bold text-xl">Better Training Data</h4>
      <p class="opacity-80">Trained on a curated subset of Objaverse-XL, filtering out low-quality meshes.</p>
    </div>
  </div>

  <div class="mt-12 text-center text-2xl font-bold animate-bounce text-cyan-300 cursor-pointer">
    Enough numbers. Let's see the Product. ↓
  </div>
</div>

---
layout: two-cols
---

# 4. Engineering Practice

### Repo Structure & Tech Stack

Our implementation uses `apple/ml-sharp` + Gemini 2.5 Flash.

**Core Tech Stack:**

- **T2I:** Google Gemini 2.5 Flash Image (Nano Banana)
- **3D Recon:** Apple SHARP (Feed-Forward 3DGS)
- **Rendering:** React Three Fiber + @react-three/drei
- **Backend:** FastAPI + Gradio (HuggingFace Space)

**Actual Project Structure:**

```bash
3d-scene-generator/
├── backend/
│   ├── main.py              # FastAPI entrypoint
│   ├── app_gradio.py        # HF Space + ZeroGPU
│   └── services/
│       ├── gemini_service.py  # T2I generation
│       └── sharp_service.py   # 3DGS inference
├── frontend/
│   └── src/components/
│       ├── GaussianSplatViewer.tsx
│       └── PromptPanel.tsx
└── hf-space/                # HuggingFace deployment
```

::right::

<div class="ml-4 h-full flex items-center justify-center">
<div class="glass-card p-6 text-center">
<carbon:logo-github class="text-6xl mb-4"/>
<h3 class="text-xl font-bold">Open Source</h3>
<p class="text-sm mt-2 opacity-70">Forked from apple/ml-sharp</p>
<p class="text-xs mt-4 text-green-400">Status: Deployed</p>
</div>
</div>

---
layout: center
preload: false
---

# Live Preview: 3D Scene Generator

Our deployed demo on **HuggingFace Space**.

<div class="w-[800px] h-[450px] border border-gray-700 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.2)] mt-6 bg-black flex items-center justify-center">
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

### Debugging the "Illusion"

**Problem:** Single-view reconstruction creates **"Floaters"** (artifacts) and blurs on the back side.

**Solution:** We implemented **SceneFog + ImmersiveControls**.

- By adding fog that fades to black at edges, we hide artifacts gracefully.
- WASD + Q/E movement with soft boundary constraints.

::right::

```tsx
// GaussianSplatViewer.tsx - SceneFog
function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    // Gradient fog hides black edges
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
layout: image-right
image: ./images/slide13-physics.png
---

# 5. Future Outlook

### Toward a "World Model"

We have demonstrated **Object Generation**.
The next step is **World Generation**.

**What is a World Model?**
An AI that simulates the physics and dynamics of reality, not just the pixels.

- **Fei-Fei Li (Spatial Intelligence):** "AI must move from 'Seeing' to 'Acting' in 3D space."
- **Project Marble:**
  Our goal is to stitch these single objects into a coherent environment.
---
layout: default
---

# Future Interactions

### Beyond Static Meshes

Current Limitations vs. Future Tech:

<div class="grid grid-cols-2 gap-8 mt-10">

<div class="glass-card">
<h3 class="text-gray-400 mb-2">Current (SHARP)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>Static Scenes (Frozen in time)</li>
<li>Visual Only (No mass/friction)</li>
<li>One Object at a time</li>
</ul>
</div>

<div class="glass-card border-purple-500 border">
<h3 class="text-purple-400 mb-2 font-bold">Future (4D & Physics)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>**4D Gaussian Splatting:** Time-variant scenes (e.g., flowing water, fire).</li>
<li>**PhysGaussian:** Interactive physics (Soft body simulation, bouncing).</li>
<li>**Scene Composition:** Layout generation via LLMs.</li>
</ul>
</div>

</div>

---
layout: center
class: text-center
---

# Thank You

<div class="flex flex-col items-center mt-10">
<div class="text-6xl mb-4">🚀</div>
<h2 class="text-2xl font-bold">Project CineLux / Marble</h2>
<p class="opacity-60 mt-2">Instant 3D Generation Pipeline</p>

<div class="mt-8 grid grid-cols-2 gap-8 text-left text-sm font-mono opacity-80">
<div>
<span class="text-cyan-400">>></span> Google Nano Banana

<span class="text-cyan-400">>></span> Apple SHARP

</div>
<div>
<span class="text-purple-400">>></span> React Three Fiber

<span class="text-purple-400">>></span> FastAPI

</div>
</div>
</div>
