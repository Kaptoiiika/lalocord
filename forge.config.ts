import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"
import webPackConfig from "./webpack.config.electron"

const webPackConfigList = webPackConfig({})
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
            html: "./public/index.html",
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
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "Kaptoiiika",
          name: "RipCornd",
        },
        prerelease: true,
      },
    },
  ],
}

export default config
