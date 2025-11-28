// frontend/vite.config.js
export default {
  build: {
    outDir: 'dist',
    // Ensure proper paths for production
    assetsDir: 'assets'
  },
  server: {
    // Proxy API calls to your backend in development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
}