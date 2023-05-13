import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { MakerDeb } from "@electron-forge/maker-deb"
import { MakerRpm } from "@electron-forge/maker-rpm"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"
import webPackConfig from "./webpack.config.electron"

const webPackConfigList = webPackConfig({})
const mainConfig = webPackConfigList[0]
const rendererConfig = webPackConfigList[1]
const preloadConfig = webPackConfigList[2]

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./public/favicon.ico",
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: "./public/favicon.ico",
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({
      options: {
        icon: "./public/logo512.png",
      },
    }),
    new MakerDeb({
      options: {
        icon: "./public/logo512.png",
      },
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
}

export default config
