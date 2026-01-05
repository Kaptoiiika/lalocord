/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __BUILD_VERSION__: string
declare const __BUILD_DATE_VERSION__: string

declare global {
  interface Window {
    electron: ElectronHandler
  }
}
