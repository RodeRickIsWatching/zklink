import { defineConfig } from 'vite'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import react from '@vitejs/plugin-react'
import tailwindcss from  'tailwindcss'
import autoprefixer from 'autoprefixer'
import { fileURLToPath, URL } from "node:url";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [react(),wasm(),topLevelAwait()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  worker: {
    plugins: ()=>[
      wasm(),
      topLevelAwait()
    ]
  },
  optimizeDeps: {
    exclude: [
      "@syntect/wasm"
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        // NodeModulesPolyfillPlugin(),
      ],
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss, 
        autoprefixer
      ]
    }
  }
})