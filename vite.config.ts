import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import eslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react(), eslint(), viteTsconfigPaths(), svgr()],
    server: {
      port: 3000,
      host: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    define: {
      process: {
        env,
      },
    },
    build: {
      outDir: 'build',
      assetsDir: 'static',
    },
    base: env.PUBLIC_URL,
  })
}
