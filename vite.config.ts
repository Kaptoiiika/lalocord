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
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    define: {
      __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE_VERSION__: JSON.stringify(new Date().toLocaleDateString()),
    },
    base: env.PUBLIC_URL,
  })
}
