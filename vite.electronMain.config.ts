import { UserConfig } from "vite"
import baseConfig from "./vite.electronBase.config"

export default function defineConfig(): UserConfig {
  const mainConfig: UserConfig = {
    ...baseConfig(),
    plugins: [],
  }

  return mainConfig
}
