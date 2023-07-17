import webpack from "webpack"
import { BuildOptions } from "./types/config"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

export function buildLoaders(options: BuildOptions): webpack.RuleSetRule[] {
  const cssLoader = {
    test: /\.s[ac]ss$/i,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          modules: {
            auto: (resPath: string) => resPath.includes(".module."),
            localIdentName: "[hash:base64:6]",
          },
        },
      },
      "sass-loader",
    ],
  }

  const tsLoader = {
    test: /\.(tsx|ts)$/,
    use: [
      {
        loader: "ts-loader",
      },
    ],
  }

  const svgLoader = {
    test: /\.svg$/i,
    issuer: /\.[jt]sx?$/,
    use: ["@svgr/webpack"],
  }

  const fileLoader = {
    test: /\.(png|jpe?g|gif|webp|mp3)$/i,
    use: [
      {
        loader: "file-loader",
      },
    ],
  }

  return [tsLoader, cssLoader, svgLoader, fileLoader]
}
