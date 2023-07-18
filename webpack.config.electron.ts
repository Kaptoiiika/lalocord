import webpack from "webpack"
import { BuildOptions } from "./config/build/types/config"
import { buildLoaders } from "./config/build/buildLoaders"
import { buildResolvers } from "./config/build/buildResolvers"
import { buildDefinePlugins } from "./config/build/plugins/buildDefinePlugins"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import { getEnv } from "./config/build/utils/getEnv"

export default () => {
  const env = getEnv(__dirname)

  const options: BuildOptions = {
    paths: env.paths,
    mode: env.mode,
    port: env.port,
    apiURL: env.apiURL,
    isDev: env.isDev,
    isElectron: true,
  }

  const main: webpack.Configuration = {
    entry: "./electron/main.ts",
    plugins: [new webpack.DefinePlugin(buildDefinePlugins(options))],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [{ loader: "ts-loader" }],
        },
        {
          test: /\.node$/,
          loader: "node-loader",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      modules: ["./electron", "node_modules"],
    },
  }

  const renderer: webpack.Configuration = {
    plugins: [
      new webpack.DefinePlugin(buildDefinePlugins(options)),
      new MiniCssExtractPlugin(),
    ],
    module: {
      rules: buildLoaders(options),
    },
    resolve: buildResolvers(options),
  }

  const preload: webpack.Configuration = {
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      modules: ["./electron", "node_modules"],
    },
  }

  return [main, renderer, preload]
}
