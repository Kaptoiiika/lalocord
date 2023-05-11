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

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: "main_window",
            preload: {
              js: "./electron/preload.ts",
            },
          },
        ],
      },
    }),
  ],
}

export default config
