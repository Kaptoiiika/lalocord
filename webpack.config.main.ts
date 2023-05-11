import path from "path"
import webpack from "webpack"
import { BuildEnv, BuildPaths } from "./config/build/types/config"
import dotenv from "dotenv"
import { buildWebpackConfig } from "./config/build/buildWebpackConfig"

export default (env: BuildEnv) => {
  const MODE = env.mode || "development"
  const isDev = MODE === "development"

  const fileEnv = isDev
    ? dotenv.config({ path: "./.env.development" }).parsed
    : dotenv.config({ path: "./.env" }).parsed

  const baseBuildPath = path.resolve(
    fileEnv?.electronBuildPath || __dirname,
    "out"
  )
  const paths: BuildPaths = {
    build: path.resolve(baseBuildPath, "app"),
    html: path.resolve(__dirname, "public", "index.html"),
    public: path.resolve(__dirname, "public"),
    entry: path.resolve(__dirname, "src", "index.tsx"),
    src: path.resolve(__dirname, "src"),
  }

  const APIURL = env.apiURL || fileEnv?.apiURL || ""
  const PORT = env.port || 3000

  const main: webpack.Configuration = {
    mode: "development",
    entry: "./electron/main.ts",
    target: "electron-main",
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
    output: {
      path: baseBuildPath,
      filename: "main.js",
      clean: true,
    },
  }

  const renderer: webpack.Configuration = buildWebpackConfig({
    paths,
    mode: MODE,
    port: PORT,
    apiURL: APIURL,
    isDev,
    isElectron: true,
  })
  renderer.output!.publicPath = ""
  renderer.target = "electron-renderer"
  renderer.plugins?.push(
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    })
  )

  return [renderer, main]
}
