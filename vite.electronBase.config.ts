import { UserConfig } from "vite"
import { buildDefinePlugins } from "./config/build/plugins/buildDefinePlugins"
import { getEnv } from "./config/build/utils/getEnv"

export default function defineConfig(): UserConfig {
  const env = getEnv(__dirname)

  const baseConfig: UserConfig = {
    mode: env.mode,
    server: {
      port: env.port,
    },
    resolve: {
      alias: { "@": env.paths.src },
    },
    define: buildDefinePlugins(env, { isElectron: true }),
  }

  return baseConfig
}
