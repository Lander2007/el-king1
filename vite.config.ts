import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    // Development proxy configuration
    // Only used when running `npm run dev`
    // In production (Vercel), API calls use the VITE_API_BASE_URL environment variable
    proxy: {
      '/api': {
        // Use environment variable for backend URL, with fallback to localhost:7860
        target: process.env.VITE_BACKEND_URL || 'http://localhost:7860',
        changeOrigin: true,
      },
      '/ws': {
        // WebSocket proxy for Socket.IO development
        target: process.env.VITE_BACKEND_URL || 'http://localhost:7860',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  build: {
    // Optimized build for production deployment
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false, // Disable source maps in production for smaller bundle
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router', 'zustand', 'axios'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'icons': ['lucide-react', '@mui/icons-material'],
        },
      },
    },
  },
})
