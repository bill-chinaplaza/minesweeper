import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const repo = process.env.GITHUB_REPOSITORY
  const base = repo ? `/${repo.split('/')[1]}/` : '/'
  return {
    plugins: [react()],
    base,
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      globals: true
    }
  }
})
