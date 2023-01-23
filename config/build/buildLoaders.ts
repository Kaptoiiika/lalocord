import webpack from "webpack"
import { buildBabelLoaders } from "./loaders/buildBabelLoaders"
import { buildCssLoaders } from "./loaders/buildCssLoaders"
import { BuildOptions } from "./types/config"

export function buildLoaders(options: BuildOptions): webpack.RuleSetRule[] {
  const cssLoader = buildCssLoaders(options)
  const babelLoaders = buildBabelLoaders(options)

  const svgLoader = {
    test: /\.svg$/i,
    issuer: /\.[jt]sx?$/,
    use: ["@svgr/webpack"],
  }

  const fileLoader = {
    test: /\.(png|jpe?g|gif|webp)$/i,
    use: [
      {
        loader: "file-loader",
      },
    ],
  }

  return [...babelLoaders, cssLoader, svgLoader, fileLoader]
}
