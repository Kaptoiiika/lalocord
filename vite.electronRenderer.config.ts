import { UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import baseConfig from "./vite.electronBase.config"

export default function defineConfig(): UserConfig {
  const rendererConfig: UserConfig = {
    ...baseConfig(),
    plugins: [react(), svgr({ exportAsDefault: true })],
  }

  return rendererConfig
}
