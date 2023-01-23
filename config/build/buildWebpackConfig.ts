import webpack from "webpack"
import { buildDevServer } from "./buildDevServer"
import { buildLoaders } from "./buildLoaders"
import { buildPlugins } from "./buildPlugins"
import { buildResolvers } from "./buildResolvers"
import type { BuildOptions } from "./types/config"

export function buildWebpackConfig(
  options: BuildOptions
): webpack.Configuration {
  const { paths, mode, isDev } = options

  const isDevOptions = isDev
    ? {
        devtool: "inline-source-map",
        devServer: buildDevServer(options),
      }
    : {}

  const webPackConfig: webpack.Configuration = {
    target: isDev ? "web" : "browserslist",
    mode: mode,
    entry: paths.entry,
    output: {
      filename: "[name].[contenthash].js",
      path: paths.build,
      clean: true,
      publicPath: "/",
    },
    plugins: buildPlugins(options),
    module: {
      rules: buildLoaders(options),
    },
    resolve: buildResolvers(options),
    ...isDevOptions,
  }

  return webPackConfig
}
