import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'unit',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', '.next/', 'coverage/'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
