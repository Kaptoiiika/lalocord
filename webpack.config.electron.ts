import path from "path"
import webpack from "webpack"
import { BuildEnv, BuildOptions, BuildPaths } from "./config/build/types/config"
import dotenv from "dotenv"
import { buildLoaders } from "./config/build/buildLoaders"
import { buildResolvers } from "./config/build/buildResolvers"
import { buildDefinePlugins } from "./config/build/plugins/buildDefinePlugins"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

export default (env: Partial<BuildEnv>) => {
  const MODE = "production"
  const isDev = false

  const fileEnv = isDev
    ? dotenv.config({ path: "./.env.development" }).parsed
    : dotenv.config({ path: "./.env" }).parsed

  const paths: BuildPaths = {
    build: path.resolve(__dirname, "main", "app"),
    html: path.resolve(__dirname, "public", "index.html"),
    public: path.resolve(__dirname, "public"),
    entry: path.resolve(__dirname, "src", "index.tsx"),
    src: path.resolve(__dirname, "src"),
  }

  const APIURL = env.apiURL || fileEnv?.apiURL || ""
  const PORT = env.port || 3000

  const options: BuildOptions = {
    paths,
    mode: MODE,
    port: PORT,
    apiURL: APIURL,
    isDev,
    isElectron: true,
  }

  const main: webpack.Configuration = {
    entry: "./electron/main.ts",
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
    plugins: [buildDefinePlugins(options), new MiniCssExtractPlugin()],
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
