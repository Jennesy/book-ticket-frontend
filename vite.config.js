// vite.config.js
import { defineConfig } from 'vite'
import vue           from '@vitejs/plugin-vue'
import UnoCSS        from 'unocss/vite'
import path          from 'path'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer({}),
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: [
      '.vue',
      '.js', 
      '.ts', 
      '.jsx', 
      '.tsx', 
      '.json',
    ],
  }
})
