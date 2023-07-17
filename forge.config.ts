import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { VitePlugin } from "@electron-forge/plugin-vite"

const config: ForgeConfig = {
  packagerConfig: {
    usageDescription: {
      Camera: "Needed for video calls",
      Microphone: "Needed for voice calls",
    },
    icon: "./public/favicon.ico",
  },
  makers: [
    new MakerSquirrel({
      setupIcon: "./public/favicon.ico",
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "./electron/main.ts",
          config: "./vite.electronMain.config.ts",
        },
        {
          entry: "./electron/preload.ts",
          config: "./vite.electronPreload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "./vite.electronRenderer.config.ts",
        },
      ],
    }),
  ],
}

export default config
