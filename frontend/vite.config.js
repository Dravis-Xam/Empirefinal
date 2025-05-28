import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist"
  }
  /*server: {
    https: {
      key: fs.readFileSync('./certs/private.key'),
      cert: fs.readFileSync('./certs/certificate.crt'),
    },
    port: 5173,
  },*/
})
