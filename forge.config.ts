import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"
import webPackConfig from "./webpack.config.electron"
import githubPublisher from "@electron-forge/publisher-github"

const webPackConfigList = webPackConfig()
const mainConfig = webPackConfigList[0]
const rendererConfig = webPackConfigList[1]
const preloadConfig = webPackConfigList[2]

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    usageDescription: {
      Camera: "Needed for video calls",
      Microphone: "Needed for voice calls",
    },
    icon: "./public/favicon.ico",
  },
  rebuildConfig: {
    disablePreGypCopy: true,
  },
  makers: [
    new MakerSquirrel({
      setupIcon: "./public/favicon.ico",
      remoteReleases: "https://github.com/Kaptoiiika/RipCornd",
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
        name: "RipCornd",
      },
      authToken: process.env.GITHUB_TOKEN
    }),
  ],
}

export default config
