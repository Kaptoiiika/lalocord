import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import eslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import type { PluginOption } from 'vite';

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isElectron = mode === 'electron'

  const electronHtml: Record<string, string> = isElectron
    ? {
        overlay: resolve(__dirname, 'electron/renderer/overlay/overlay.html'),
      }
    : {}

  const electronPlugins: PluginOption[] = isElectron
    ? [
        electron([
          {
            entry: 'electron/main.ts',
            onstart(options) {
              options.startup()
            },
            vite: {
              build: {
                outDir: 'dist-electron',
                rollupOptions: {
                  external: ['electron', 'electron-overlay-window'],
                },
              },
              define: {
                __IS_DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
              },
            },
          },
          {
            entry: 'electron/preload.ts',
            onstart(options) {
              options.reload()
            },
            vite: {
              build: {
                outDir: 'dist-electron',
                rollupOptions: {
                  external: ['electron'],
                },
              },
            },
          },
        ]),
        electronRenderer(),
      ]
    : []

  return defineConfig({
    plugins: [react(), eslint(), viteTsconfigPaths(), svgr(), ...electronPlugins],
    build: {
      rollupOptions: {
        input: {
          ...electronHtml,
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
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
    base: isElectron ? './' : env.PUBLIC_URL,
  })
}
