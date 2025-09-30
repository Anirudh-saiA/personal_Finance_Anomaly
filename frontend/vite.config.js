import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // Import tailwindcss
import autoprefixer from 'autoprefixer' // Import autoprefixer

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is the new, important part
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})