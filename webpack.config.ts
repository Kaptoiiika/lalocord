import path from "path"
import webpack from "webpack"
import { buildWebpackConfig } from "./config/build/buildWebpackConfig"
import { BuildEnv, BuildPaths } from "./config/build/types/config"
import dotenv from "dotenv"

export default (env: BuildEnv) => {
  const MODE = env.mode || "development"
  const isDev = MODE === "development"

  const fileEnv = isDev
    ? dotenv.config({ path: "./.env.development" }).parsed
    : dotenv.config({ path: "./.env" }).parsed

  const paths: BuildPaths = {
    entry: path.resolve(__dirname, "src", "index.tsx"),
    build: path.resolve(fileEnv?.buildPath || __dirname, "dist"),
    html: path.resolve(__dirname, "public", "index.html"),
    src: path.resolve(__dirname, "src"),
  }

  const PORT = env.port || 3000
  const APIURL = env.apiURL || fileEnv?.apiURL || ""

  const config: webpack.Configuration = buildWebpackConfig({
    paths,
    mode: MODE,
    port: PORT,
    apiURL: APIURL,
    isDev,
  })

  return config
}
