import webpack from "webpack"
import { BuildOptions } from "./types/config"

export function buildResolvers(option: BuildOptions): webpack.ResolveOptions {
  const { paths } = option
  return {
    extensions: [".tsx", ".ts", ".js"],
    modules: [paths.src, "node_modules"],
    preferAbsolute: true,
    alias: {
      "@": option.paths.src,
    },
  }
}
