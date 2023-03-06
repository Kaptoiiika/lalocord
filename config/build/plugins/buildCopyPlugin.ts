import CopyPlugin from "copy-webpack-plugin"
import path from "path"
import { BuildPaths } from "../types/config"

export const buildCopyPlugin = (paths: BuildPaths) => {
  return new CopyPlugin({
    patterns: [
      {
        from: paths.public,
        to: paths.build,
        filter: (filePath) => {
          return path.resolve(filePath) !== path.resolve(paths.html)
        },
      },
    ],
  })
}
