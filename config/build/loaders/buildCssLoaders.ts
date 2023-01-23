import MiniCssExtractPlugin from "mini-css-extract-plugin"

export function buildCssLoaders(options: { isDev: boolean }) {
  const { isDev } = options

  return {
    test: /\.s[ac]ss$/i,
    use: [
      isDev ? "style-loader" : MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          modules: {
            auto: (resPath: string) => resPath.includes(".module."),
            localIdentName: isDev
              ? "[path][name][local]"
              : "[hash:base64:6]",
          },
        },
      },
      "sass-loader",
    ],
  }
}
