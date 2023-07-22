import path from "path"
import dotenv from "dotenv"
import { BuildOptions, BuildPaths } from "../types/config"

export const getEnv = (dirName: string): Omit<BuildOptions, "isElectron"> => {
  const MODE = process.env.mode === "development" ? "development" : "production"
  const isDev = true //MODE === "development"

  const fileEnv = isDev
    ? dotenv.config({ path: "../../../.env.development" }).parsed
    : dotenv.config({ path: "../../.././.env" }).parsed

  const paths: BuildPaths = {
    build: path.resolve(
      process.env.buildPath || fileEnv?.buildPath || dirName,
      "dist"
    ),
    html: path.resolve(dirName, "index.html"),
    public: path.resolve(dirName, "public"),
    entry: path.resolve(dirName, "src", "index.tsx"),
    src: path.resolve(dirName, "src"),
  }

  const PORT = Number(process.env.port) || Number(fileEnv?.port) || 3000
  const APIURL = process.env.apiURL || fileEnv?.apiURL || ""

  return {
    mode: MODE,
    apiURL: APIURL,
    port: PORT,
    paths: paths,
    isDev: isDev,
  }
}
