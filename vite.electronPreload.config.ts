import { UserConfig } from "vite"
import baseConfig from "./vite.electronBase.config"

export default function defineConfig(): UserConfig {
  const preloadConfig: UserConfig = {
    ...baseConfig(),
    plugins: [],
  }

  return preloadConfig
}
