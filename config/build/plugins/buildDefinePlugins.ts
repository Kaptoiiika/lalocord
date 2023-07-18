import { BuildOptions } from "../types/config"

export const buildDefinePlugins = (
  options: Pick<BuildOptions, "apiURL" | "isDev" | "isElectron">,
) => {
  const { isDev, apiURL, isElectron } = options

  return {
    __IS_DEV__: JSON.stringify(isDev),
    __API_URL__: JSON.stringify(apiURL),
    __IS_ELECTRON__: JSON.stringify(isElectron || false),
    __BUILD_VERSION__: JSON.stringify(
      `${new Date().getDate()}-${
        new Date().getMonth() + 1
      }-${new Date().getFullYear()}`
    ),
  }
}
