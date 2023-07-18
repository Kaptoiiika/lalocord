import { BuildOptions } from "../types/config"
import PACKAGE from "../../../package.json"

export const buildDefinePlugins = (
  options: Pick<BuildOptions, "apiURL" | "isDev" | "isElectron">
) => {
  const { isDev, apiURL, isElectron } = options
  const currentVersion = PACKAGE.version

  return {
    __IS_DEV__: JSON.stringify(isDev),
    __API_URL__: JSON.stringify(apiURL),
    __IS_ELECTRON__: JSON.stringify(isElectron || false),
    __BUILD_DATE_VERSION__: JSON.stringify(
      `${new Date().getDate()}-${
        new Date().getMonth() + 1
      }-${new Date().getFullYear()}`
    ),
    __BUILD_VERSION__: JSON.stringify(currentVersion),
  }
}
