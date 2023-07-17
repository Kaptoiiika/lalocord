import { UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import { buildDefinePlugins } from "./config/build/plugins/buildDefinePlugins"
import { getEnv } from "./config/build/utils/getEnv"

export default function defineConfig(): UserConfig {
  const env = getEnv(__dirname)

  return {
    publicDir: env.paths.public,
    server: {
      port: env.port,
    },
    resolve: {
      alias: { "@": env.paths.src },
    },
    build: {
      sourcemap: "hidden",
      outDir: env.paths.build,
      rollupOptions: {
        input: {
          app: env.paths.html,
        },
      },
    },
    plugins: [react(), svgr({ exportAsDefault: true })],
    define: buildDefinePlugins(env),
  }
}
