import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import CircularDependencyPlugin from "circular-dependency-plugin"
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin"
import HTMLWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import webpack from "webpack"
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"
import { buildDefinePlugins } from "./plugins/buildDefinePlugins"
import { BuildOptions } from "./types/config"

export function buildPlugins(
  options: BuildOptions
): webpack.WebpackPluginInstance[] {
  const { paths, isDev } = options
  const plugins = [
    new HTMLWebpackPlugin({
      template: paths.html,
    }),
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:6].css",
      chunkFilename: "css/[name].[contenthash:6].css",
    }),
    buildDefinePlugins(options),
    new ReactRefreshWebpackPlugin(),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: "write-references",
      },
    }),
  ]

  if (isDev) {
    plugins.push(new BundleAnalyzerPlugin())
  }
  // if (true) {
  //   plugins.push(new BundleAnalyzerPlugin({}))
  // }

  return plugins
}
