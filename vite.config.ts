/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the static build works from any sub-path (GitHub Pages, Netlify, Vercel).
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
