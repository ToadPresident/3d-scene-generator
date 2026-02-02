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
    "一句话生成3D世界"
  </p>
  <p class="text-xl opacity-70 mb-8">
    From Generative Priors to Feed-Forward Geometry
  </p>
  
  <div class="absolute bottom-10 left-0 w-full text-center opacity-50 text-sm font-mono">
    深度学习期末项目 · Powered by Apple SHARP
  </div>
</div>

---
layout: image-right
image: ./images/slide2-studio.png
---

<div class="ml-4">

# 1. The Bottleneck

### Photogrammetry (摄影测量)

传统3D重建的第一种方法：从现实世界扫描。

<br>

- **原理:** 使用多角度照片重建3D模型
- **需求:**
  - 物理对象必须存在
  - 复杂的相机阵列 + 受控光线
- **痛点:**
  - <strong>无法扫描不存在的东西</strong>
  - 无法用于创意内容生成

</div>

---

# NeRF & Optimization-based 3DGS

### 优化式方法：每个场景都要"重新训练"

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="glass-card">
<h3 class="text-cyan-400 font-bold mb-4">NeRF (Neural Radiance Fields)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>需要 50-100 张重叠图像</li>
<li>训练时间：30分钟 - 1小时 <strong>每个物体</strong></li>
<li>输出：隐式神经场（需要ray marching）</li>
</ul>
</div>

<div class="glass-card">
<h3 class="text-purple-400 font-bold mb-4">3D Gaussian Splatting (3DGS)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>同样需要多视角图像</li>
<li>更快的渲染（实时）</li>
<li>但仍需 <strong>逐场景优化</strong></li>
</ul>
</div>

</div>

<div class="mt-8 text-center text-2xl font-bold text-red-400">
  痛点：每个新物体都要重新训练 → 无法规模化
</div>

---
layout: center
class: text-center
---

# The Revolution: Feed-Forward

<div class="text-4xl font-bold mt-10 leading-relaxed">
  从 "优化" 到 "预测"
</div>

<div class="grid grid-cols-2 gap-12 mt-12 items-center max-w-3xl mx-auto">
  
  <div class="glass-card text-center py-10 opacity-50 grayscale">
    <div class="text-2xl mb-2">旧方法: Optimization</div>
    <div class="text-sm">Iterative Gradient Descent</div>
    <div class="text-4xl font-mono mt-4 text-red-400">~40 Mins</div>
  </div>

  <div class="glass-card text-center py-10 border-cyan-500 border-2 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
    <div class="text-2xl mb-2 font-bold text-cyan-300">新方法: Feed-Forward</div>
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

- **社区反应:**
  - GitHub Stars: **5.2k+** (第一个月)
  - Twitter/X: 被称为 "Midjourney for 3D"
- **为什么火爆?**
  - 首个移动端优化的 SOTA 模型
  - 桌面GPU级别的质量

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

# Feed-Forward 原理

### 什么是 "前馈" 模型？

不同于 NeRF（"记忆" 场景），SHARP **"理解"** 几何。

<div class="grid grid-cols-3 gap-4 mt-8">
  <div class="col-span-1 glass-card">
    <h4 class="text-cyan-400 font-bold">1. Encoder</h4>
    <p class="text-sm mt-2">提取2D图像的深层特征（纹理、边缘、语义）</p>
  </div>
  <div class="col-span-1 glass-card">
    <h4 class="text-purple-400 font-bold">2. Predictor</h4>
    <p class="text-sm mt-2">Transformer预测数千个高斯的3D位置(XYZ)和形状(协方差)</p>
  </div>
  <div class="col-span-1 glass-card">
    <h4 class="text-green-400 font-bold">3. Output</h4>
    <p class="text-sm mt-2">直接输出 `.ply` 点云。无循环，无迭代，一次通过。</p>
  </div>
</div>

<div class="mt-6 p-4 border border-dashed border-gray-600 rounded text-center text-sm font-mono">
  Image (Pixels) → Neural Network → 3D Gaussians (Geometry)
</div>

---

# 技术细节：为什么这么强？

<div class="text-left max-w-3xl mx-auto space-y-6 mt-8">
  <div class="flex items-start gap-4">
    <div class="bg-cyan-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</div>
    <div>
      <h4 class="font-bold text-xl">Epipolar Constraints (对极约束)</h4>
      <p class="opacity-80">SHARP 不是随机猜测，它在网络层内部强制执行视觉的物理定律（对极几何）。</p>
    </div>
  </div>

  <div class="flex items-start gap-4">
    <div class="bg-cyan-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</div>
    <div>
      <h4 class="font-bold text-xl">高质量训练数据</h4>
      <p class="opacity-80">在 Objaverse-XL 的精选子集上训练，过滤了低质量网格。</p>
    </div>
  </div>

  <div class="flex items-start gap-4">
    <div class="bg-cyan-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</div>
    <div>
      <h4 class="font-bold text-xl">高效架构</h4>
      <p class="opacity-80">移动端优化，可在 iPhone/iPad 上实时运行。</p>
    </div>
  </div>
</div>

---
layout: image-right
image: ./images/slide4-architecture.png
---

# 能力与类比

### "Stable Diffusion for 3D"

就像 **Stable Diffusion** 改变了2D艺术，**SHARP** 改变了3D资产。

<br>

- **类比:**
  - **Text-to-Image:** 输入"猫"，0.5秒得到 JPG
  - **Image-to-3D:** 输入 JPG，0.2秒得到3D模型

- **关键能力:**
  1. **泛化:** 猫、车、建筑、抽象艺术都能处理
  2. **视图一致性:** 合理"幻想"物体背面

---

# 3. Benchmarks

### 定义3D生成AI的"质量"

在看数据之前，我们必须理解 **衡量标准**。

<div class="flex gap-4 mt-8 text-left">
  
  <div class="flex-1 glass-card border-l-4 border-blue-500">
    <h3 class="font-bold text-lg">PSNR / SSIM</h3>
    <p class="text-xs mt-2 opacity-70">"像素完美度"</p>
    <p class="text-sm mt-2">传统信号处理指标。测量像素与真实值的匹配程度。</p>
  </div>

  <div class="flex-1 glass-card border-l-4 border-purple-500">
    <h3 class="font-bold text-lg">LPIPS</h3>
    <p class="text-xs mt-2 opacity-70">"人类感知"</p>
    <p class="text-sm mt-2"><strong>关键指标。</strong>测量对人眼的"真实感"。<span class="text-purple-400">越低越好。</span></p>
  </div>

  <div class="flex-1 glass-card border-l-4 border-green-500">
    <h3 class="font-bold text-lg">FPS / Inference Time</h3>
    <p class="text-xs mt-2 opacity-70">"速度"</p>
    <p class="text-sm mt-2">生成单个资产的时间。<span class="text-green-400">实时应用的关键。</span></p>
  </div>

</div>

---

# 对比数据：碾压竞争对手

与 SOTA 方法对比 (LGM, Splatter Image, OpenLRM)

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
<h3 class="text-2xl font-bold">速度优势</h3>
<p class="mt-2">SHARP 比 LGM 快 <span class="text-green-400 font-bold">3x</span>，比 DreamFusion 快 <span class="text-green-400 font-bold">2000x</span></p>
</div>

</div>

---
layout: center
---

# 结论：全方位碾压

<div class="text-center mt-12">
  <div class="text-6xl font-black text-cyan-400 mb-4">🏆</div>
  <p class="text-2xl">SHARP 在质量和速度上同时领先</p>
  <p class="mt-4 opacity-70">Enough numbers. Let's see the Product. ↓</p>
</div>

---
layout: two-cols
---

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

# Debug 经验

### 解决 "幻觉" 问题

**问题:** 单视角重建会产生 **"Floaters"** (伪影) 和背面模糊。

**解决方案:** 我们实现了 **SceneFog + 相机限位**

- 雾效渐变到黑色，优雅隐藏边缘伪影
- WASD + Q/E 移动，带软边界约束

::right::

```tsx
// GaussianSplatViewer.tsx
function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    // 雾效隐藏黑边
    scene.fog = new THREE.Fog(0x000000, 1.5, 4);
    scene.background = new THREE.Color(0x000000);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

// 移动边界
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

# 5. Future Outlook: World Model

### 从 "物体生成" 到 "世界生成"

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="glass-card">
<h3 class="text-cyan-400 font-bold mb-4">Fei-Fei Li 的愿景</h3>
<p class="text-sm">"AI 必须从 '看' 转向在3D空间中 '行动'。"</p>
<p class="text-sm mt-4 opacity-70">— Spatial Intelligence, 2024</p>
</div>

<div class="glass-card border-purple-500 border">
<h3 class="text-purple-400 font-bold mb-4">World Labs</h3>
<p class="text-sm"><strong>Project Marble:</strong> 一个能从各种输入生成和维护一致3D环境的 "世界模型"。</p>
<p class="text-sm mt-4 opacity-70">基于 3D Gaussian Splatting 技术</p>
</div>

</div>

<div class="mt-8 text-center">
<p class="text-xl">World Model = 不仅模拟像素，还模拟 <strong>物理和动态</strong></p>
</div>

---

# 3DGS 的广泛应用

### 不止于3D生成

<div class="grid grid-cols-3 gap-6 mt-8">

<div class="glass-card text-center">
<div class="text-4xl mb-4">🥽</div>
<h3 class="font-bold text-lg">Apple Vision Pro</h3>
<p class="text-sm mt-2 opacity-70">空间计算的核心技术，实现沉浸式AR体验</p>
</div>

<div class="glass-card text-center">
<div class="text-4xl mb-4">🎮</div>
<h3 class="font-bold text-lg">游戏资产生成</h3>
<p class="text-sm mt-2 opacity-70">快速为游戏创建NPC、道具、场景</p>
</div>

<div class="glass-card text-center">
<div class="text-4xl mb-4">🎬</div>
<h3 class="font-bold text-lg">虚拟制片</h3>
<p class="text-sm mt-2 opacity-70">Pre-visualization, LED Wall背景生成</p>
</div>

</div>

<div class="mt-8 text-center glass-card py-4">
<p class="text-lg">3DGS 正在成为 <strong>空间智能 (Spatial Intelligence)</strong> 的基础设施</p>
</div>

---

# 未来技术：4D & Physics

### 从静态到动态

<div class="grid grid-cols-2 gap-8 mt-10">

<div class="glass-card">
<h3 class="text-gray-400 mb-2">当前 (SHARP)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li>静态场景（时间冻结）</li>
<li>仅视觉（无质量/摩擦）</li>
<li>一次一个物体</li>
</ul>
</div>

<div class="glass-card border-purple-500 border">
<h3 class="text-purple-400 mb-2 font-bold">未来 (4D & Physics)</h3>
<ul class="list-disc pl-5 space-y-2 text-sm">
<li><strong>4D Gaussian Splatting:</strong> 时变场景（流水、火焰）</li>
<li><strong>PhysGaussian:</strong> 交互物理（软体模拟、弹跳）</li>
<li><strong>Scene Composition:</strong> LLM 驱动的场景布局</li>
</ul>
</div>

</div>

<div class="mt-8 text-center">
<p class="opacity-70">CVPR 2024: PhysGaussian 首次实现物理感知的高斯溅射</p>
</div>

---
layout: center
class: text-center
---

# Thank You

<div class="flex flex-col items-center mt-10">
<div class="text-6xl mb-4">🚀</div>
<h2 class="text-2xl font-bold">深度学习期末项目</h2>
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
