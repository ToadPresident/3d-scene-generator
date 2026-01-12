/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Transpile gsplat.js for compatibility
  transpilePackages: ["gsplat", "three"],
  
  // Configure webpack for Three.js and WASM support
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
  
  // Experimental features for 2026
  experimental: {
    // Enable Turbopack for faster builds (stable in Next.js 15)
    turbo: {
      rules: {
        "*.ply": {
          loaders: ["file-loader"],
        },
      },
    },
  },
};

export default nextConfig;
