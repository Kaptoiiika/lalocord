import path from "path"
import { Configuration } from "webpack"
import { buildCssLoaders } from "../build/loaders/buildCssLoaders"
import { buildDefinePlugins } from "../build/plugins/buildDefinePlugins"
import { BuildPaths } from "../build/types/config"

export default ({ config }: { config: Configuration }) => {
  const paths: BuildPaths = {
    build: "",
    entry: "",
    html: "",
    src: path.resolve(__dirname, "..", "..", "src"),
  }

  config.resolve!.modules!.push(paths.src)
  config.resolve!.extensions!.push(".ts", ".tsx")
  config.resolve!.alias = {
    ...config.resolve!.alias,
    "@": paths.src,
  }

  const cssLoader = buildCssLoaders({ isDev: true })
  config.module!.rules!.push(cssLoader)

  config.module!.rules = config.module!.rules!.map((rule) => {
    if (rule === "...") return rule

    if (/svg/.test(rule.test as string)) {
      return { ...rule, exclude: /\.svg$/i }
    }

    return rule
  })
  config.module!.rules!.push({
    test: /\.svg$/,
    use: ["@svgr/webpack"],
  })

  config.plugins!.push(
    buildDefinePlugins({ apiURL: "http://localhost/", isDev: true })
  )

  return config
}
