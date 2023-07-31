import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"
import webPackConfig from "./webpack.config.electron"
import githubPublisher from "@electron-forge/publisher-github"
import dotenv from "dotenv"

const webPackConfigList = webPackConfig()
const mainConfig = webPackConfigList[0]
const rendererConfig = webPackConfigList[1]
const preloadConfig = webPackConfigList[2]

const fileEnv = dotenv.config({ path: "./.env" }).parsed

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "./public/favicon.ico",
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      iconUrl: "https://kapitoxa.lol/favicon.ico",
      setupIcon: "./public/favicon.ico",
    }),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: "*",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./index.electron.html",
            js: "./electron/renderer.ts",
            name: "main_window",

            preload: {
              config: preloadConfig,
              js: "./electron/preload.ts",
            },
          },
        ],
      },
    }),
  ],
  publishers: [
    new githubPublisher({
      repository: {
        owner: "Kaptoiiika",
        name: "lalocord",
      },
      authToken: process.env.GITHUB_TOKEN ?? fileEnv?.GITHUB_TOKEN,
      draft: false,
      prerelease: false,
    }),
  ],
}

export default config
